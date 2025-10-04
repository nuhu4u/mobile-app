const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * Clean All Votes Script
 * Removes all votes from the database so users can vote again
 * Also resets vote counts for elections and candidates
 */

async function cleanAllVotes() {
  const client = new MongoClient(process.env.DATABASE_URL || 'mongodb://localhost:27017/election_system');
  
  try {
    console.log('🧹 Starting vote cleanup...');
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully');
    
    const db = client.db('election_system');
    
    // 1. Clean all votes from votes collection
    console.log('\n🗳️  Cleaning votes collection...');
    const votesResult = await db.collection('votes').deleteMany({});
    console.log(`   Deleted ${votesResult.deletedCount} vote records`);
    
    // 2. Clean vote history from users
    console.log('\n👤 Cleaning user vote history...');
    const usersResult = await db.collection('users').updateMany({}, {
      $unset: {
        voteHistory: "",
        lastVoteTime: "",
        votedElections: ""
      },
      $set: {
        hasVoted: false,
        updated_at: new Date()
      }
    });
    console.log(`   Updated ${usersResult.modifiedCount} user records`);
    
    // 3. Reset vote counts for elections
    console.log('\n🏛️  Resetting election vote counts...');
    const electionsResult = await db.collection('elections').updateMany({}, {
      $set: {
        total_votes: 0,
        updated_at: new Date()
      }
    });
    console.log(`   Updated ${electionsResult.modifiedCount} elections`);
    
    // 4. Reset vote counts for candidates/contestants
    console.log('\n👥 Resetting candidate vote counts...');
    const candidatesResult = await db.collection('elections').updateMany(
      { 'contestants.votes': { $exists: true } },
      { 
        $set: { 
          'contestants.$[].votes': 0,
          updated_at: new Date()
        }
      }
    );
    console.log(`   Updated candidates in ${candidatesResult.modifiedCount} elections`);
    
    // 5. Clean blockchain transaction records (if any)
    console.log('\n🔗 Cleaning blockchain transaction records...');
    const blockchainResult = await db.collection('blockchain_transactions').deleteMany({});
    console.log(`   Deleted ${blockchainResult.deletedCount} blockchain transaction records`);
    
    // 6. Clean vote verification logs
    console.log('\n🔐 Cleaning vote verification logs...');
    const verificationResult = await db.collection('vote_verification_logs').deleteMany({});
    console.log(`   Deleted ${verificationResult.deletedCount} verification log records`);
    
    // 7. Clean user biometric verification status (optional - keeps enrollment but resets voting)
    console.log('\n🔐 Resetting biometric voting status...');
    const biometricResult = await db.collection('users').updateMany({}, {
      $unset: {
        last_vote_biometric_used: "",
        vote_biometric_attempts: ""
      },
      $set: {
        updated_at: new Date()
      }
    });
    console.log(`   Updated biometric status for ${biometricResult.modifiedCount} users`);
    
    // 8. Clean enhanced biometric voting records (if using enhanced system)
    console.log('\n🔐 Cleaning enhanced biometric voting records...');
    const enhancedBiometricResult = await db.collection('user_biometrics').updateMany({}, {
      $unset: {
        last_vote_used: "",
        vote_verification_count: ""
      },
      $set: {
        updated_at: new Date()
      }
    });
    console.log(`   Updated enhanced biometric records for ${enhancedBiometricResult.modifiedCount} users`);
    
    // 9. Reset election statistics
    console.log('\n📊 Resetting election statistics...');
    await db.collection('election_stats').deleteMany({});
    console.log('   Cleared all election statistics');
    
    // 10. Clean any vote-related analytics
    console.log('\n📈 Cleaning vote analytics...');
    const analyticsResult = await db.collection('vote_analytics').deleteMany({});
    console.log(`   Deleted ${analyticsResult.deletedCount} analytics records`);
    
    console.log('\n✅ VOTE CLEANUP COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Summary:');
    console.log(`   • ${votesResult.deletedCount} votes deleted`);
    console.log(`   • ${usersResult.modifiedCount} users reset`);
    console.log(`   • ${electionsResult.modifiedCount} elections reset`);
    console.log(`   • ${candidatesResult.modifiedCount} candidate vote counts reset`);
    console.log(`   • ${blockchainResult.deletedCount} blockchain records deleted`);
    console.log(`   • ${verificationResult.deletedCount} verification logs deleted`);
    console.log(`   • ${biometricResult.modifiedCount} biometric voting records reset`);
    console.log(`   • ${enhancedBiometricResult.modifiedCount} enhanced biometric records updated`);
    console.log(`   • Analytics and statistics cleared`);
    
    console.log('\n🎯 All users can now vote again!');
    console.log('🔐 Biometric enrollment status is preserved');
    console.log('🗳️  Vote counts have been reset to zero');
    
  } catch (error) {
    console.error('❌ Error during vote cleanup:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the cleanup
if (require.main === module) {
  console.log('🚀 VOTE CLEANUP SCRIPT');
  console.log('=====================');
  console.log('This script will:');
  console.log('• Delete all vote records');
  console.log('• Reset user voting status');
  console.log('• Reset election and candidate vote counts');
  console.log('• Clean blockchain transaction records');
  console.log('• Reset verification logs');
  console.log('• Preserve biometric enrollment');
  console.log('');
  
  // Add confirmation prompt
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('⚠️  Are you sure you want to clean all votes? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      rl.close();
      cleanAllVotes();
    } else {
      console.log('❌ Vote cleanup cancelled');
      rl.close();
      process.exit(0);
    }
  });
}

module.exports = { cleanAllVotes };
