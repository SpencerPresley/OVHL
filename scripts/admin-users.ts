import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Create readline interface for CLI interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * List all users with their admin status
 */
async function listUsers() {
  console.log('\nListing all users...');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      isAdmin: true,
    },
    orderBy: {
      email: 'asc',
    },
  });

  if (users.length === 0) {
    console.log('No users found in the database.');
    return;
  }

  console.log('\nUSER LIST:');
  console.log('='.repeat(80));
  console.log('ID | Email | Name | Username | Admin Status');
  console.log('-'.repeat(80));

  users.forEach(user => {
    console.log(`${user.id} | ${user.email} | ${user.name || 'N/A'} | ${user.username || 'N/A'} | ${user.isAdmin ? 'YES' : 'NO'}`);
  });
  console.log('='.repeat(80));
  console.log(`Total users: ${users.length}\n`);
}

/**
 * Grant admin privileges to a user
 * @param email User email to grant admin privileges
 */
async function grantAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    if (user.isAdmin) {
      console.log(`User ${email} already has admin privileges.`);
      return;
    }

    await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });

    console.log(`✅ Admin privileges granted to ${email}.`);
  } catch (error) {
    console.error('Error granting admin privileges:', error);
  }
}

/**
 * Revoke admin privileges from a user
 * @param email User email to revoke admin privileges
 */
async function revokeAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    if (!user.isAdmin) {
      console.log(`User ${email} doesn't have admin privileges.`);
      return;
    }

    await prisma.user.update({
      where: { email },
      data: { isAdmin: false },
    });

    console.log(`❌ Admin privileges revoked from ${email}.`);
  } catch (error) {
    console.error('Error revoking admin privileges:', error);
  }
}

/**
 * Show help menu
 */
function showHelp() {
  console.log('\nAdmin User Management Tool');
  console.log('='.repeat(30));
  console.log('Available commands:');
  console.log('  list                 - List all users and their admin status');
  console.log('  grant <email>        - Grant admin privileges to a user');
  console.log('  revoke <email>       - Revoke admin privileges from a user');
  console.log('  help                 - Show this help menu');
  console.log('  exit                 - Exit the program');
  console.log('='.repeat(30));
}

/**
 * Main CLI loop
 */
async function main() {
  showHelp();

  rl.setPrompt('admin-tool> ');
  rl.prompt();

  rl.on('line', async (line) => {
    const [command, ...args] = line.trim().split(' ');

    try {
      switch (command.toLowerCase()) {
        case 'list':
          await listUsers();
          break;
        case 'grant':
          if (!args[0]) {
            console.log('Error: Email is required. Usage: grant <email>');
          } else {
            await grantAdmin(args[0]);
          }
          break;
        case 'revoke':
          if (!args[0]) {
            console.log('Error: Email is required. Usage: revoke <email>');
          } else {
            await revokeAdmin(args[0]);
          }
          break;
        case 'help':
          showHelp();
          break;
        case 'exit':
          console.log('Exiting admin tool...');
          await prisma.$disconnect();
          process.exit(0);
          break;
        default:
          console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
          break;
      }
    } catch (error) {
      console.error('Error executing command:', error);
    }

    rl.prompt();
  });

  rl.on('close', async () => {
    console.log('Closing admin tool...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

// Run the program
main().catch(async (error) => {
  console.error('Error in admin tool:', error);
  await prisma.$disconnect();
  process.exit(1);
}); 