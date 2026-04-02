-- This migration must run only after backfill-platforms.ts assigns a platformId to every ManagedAccount row.
ALTER TABLE `ManagedAccount` MODIFY `platformId` VARCHAR(191) NOT NULL;
