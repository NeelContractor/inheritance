#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;

declare_id!("3kXvWrPQbBhakjWEGwWTiyXBf6yebzWXVTDAqqicJG2L");

#[program]
pub mod inheritance {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, deadline: i64, beneficiary: Pubkey, seed: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(deadline > Clock::get()?.unix_timestamp, InheritanceError::InvalidDeadline);
        escrow.owner = ctx.accounts.owner.key();
        escrow.beneficiary = beneficiary;
        escrow.deadline = deadline;
        escrow.last_checkin = Clock::get()?.unix_timestamp;
        escrow.bump = ctx.bumps.escrow;
        escrow.seed = seed;

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, InheritanceError::InvalidAmount);

        anchor_lang::solana_program::program::invoke(
            &system_instruction::transfer(
                &ctx.accounts.owner.key(),
                &ctx.accounts.escrow.key(),
                amount
            ),
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.escrow.to_account_info(),
                ctx.accounts.system_program.to_account_info()
            ]
        )?;
        Ok(())
    }

    pub fn checkin(ctx: Context<Checkin>, new_deadline: i64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let now = Clock::get()?.unix_timestamp;
        require!(now < escrow.deadline, InheritanceError::DeadlineExceeded);
        require!(new_deadline > now, InheritanceError::InvalidDeadline);
        escrow.deadline = new_deadline;
        escrow.last_checkin = now;
        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        require!(Clock::get()?.unix_timestamp >= ctx.accounts.escrow.deadline, InheritanceError::DeadlineNotReached);
        let balance = ctx.accounts.escrow.to_account_info().lamports();
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? = 0;
        **ctx.accounts.beneficiary.try_borrow_mut_lamports()? += balance;
        Ok(())
    }

    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        let balance = ctx.accounts.escrow.to_account_info().lamports();
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? = 0;
        **ctx.accounts.owner.try_borrow_mut_lamports()? += balance;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(deadline: i64, beneficiary: Pubkey, seed: String)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", owner.key().as_ref(), seed.as_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub beneficiary: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", escrow.owner.key().as_ref(), escrow.seed.as_bytes().as_ref()],
        bump = escrow.bump,
        close = beneficiary
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", owner.key().as_ref(), escrow.seed.as_bytes().as_ref()],
        bump = escrow.bump,
        constraint = escrow.owner == owner.key()
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Checkin<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", owner.key().as_ref(), escrow.seed.as_bytes().as_ref()],
        bump = escrow.bump,
        constraint = escrow.owner == owner.key()
    )]
    pub escrow: Account<'info, Escrow>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"escrow", owner.key().as_ref(), escrow.seed.as_bytes().as_ref()],
        bump = escrow.bump,
        close = owner
    )]
    pub escrow: Account<'info, Escrow>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub owner: Pubkey,
    pub beneficiary: Pubkey,
    pub deadline: i64,
    pub last_checkin: i64,
    pub bump: u8,
    #[max_len(16)]
    pub seed: String
}

#[error_code]
pub enum InheritanceError {
    #[msg("Invalid deadline")]
    InvalidDeadline,
    #[msg("Invalid Amount")]
    InvalidAmount,
    #[msg("Deadline exceeded")]
    DeadlineExceeded,
    #[msg("Deadline not reach")]
    DeadlineNotReached,
}