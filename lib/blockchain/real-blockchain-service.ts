// Real blockchain service using ethers.js for actual blockchain transactions
import { ethers } from 'ethers';
import { apiConfig } from '@/lib/config';

// Election Contract ABI (from backend artifacts)
const ELECTION_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_endTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "party",
        "type": "string"
      }
    ],
    "name": "CandidateAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      }
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_voter",
        "type": "address"
      }
    ],
    "name": "registerVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "voters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getElectionInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isFinalized",
            "type": "bool"
          }
        ],
        "internalType": "struct Election.ElectionInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface BlockchainVoteRequest {
  electionId: string;
  candidateId: string;
  voterAddress: string;
  contractAddress: string;
}

export interface BlockchainVoteResponse {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

export interface WalletInfo {
  address: string;
  privateKey: string;
  balance: string;
}

class RealBlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private rpcUrl: string;

  constructor() {
    // Use the same RPC URL as configured in the backend
    this.rpcUrl = process.env.EXPO_PUBLIC_RPC_URL || 'http://10.226.155.194:8545';
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      console.log('🔗 RealBlockchainService: Provider initialized with RPC:', this.rpcUrl);
    } catch (error) {
      console.error('❌ RealBlockchainService: Failed to initialize provider:', error);
    }
  }

  /**
   * Connect wallet using private key
   */
  async connectWallet(privateKey: string): Promise<WalletInfo> {
    try {
      if (!this.provider) {
        throw new Error('Blockchain provider not initialized');
      }

      this.wallet = new ethers.Wallet(privateKey, this.provider);
      const address = await this.wallet.getAddress();
      const balance = await this.provider.getBalance(address);

      console.log('🔗 RealBlockchainService: Wallet connected:', {
        address,
        balance: ethers.formatEther(balance)
      });

      return {
        address,
        privateKey,
        balance: ethers.formatEther(balance)
      };
    } catch (error) {
      console.error('❌ RealBlockchainService: Failed to connect wallet:', error);
      throw new Error(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Register voter on the blockchain
   */
  async registerVoter(contractAddress: string): Promise<BlockchainVoteResponse> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not connected');
      }

      const contract = new ethers.Contract(contractAddress, ELECTION_CONTRACT_ABI, this.wallet);
      
      console.log('🔗 RealBlockchainService: Registering voter on contract:', contractAddress);
      
      const tx = await contract.registerVoter(this.wallet.address, {
        gasLimit: 100000
      });

      console.log('🔗 RealBlockchainService: Registration transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      
      console.log('🔗 RealBlockchainService: Voter registered successfully:', {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ RealBlockchainService: Failed to register voter:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Cast vote on the blockchain
   */
  async castVote(request: BlockchainVoteRequest): Promise<BlockchainVoteResponse> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not connected');
      }

      const contract = new ethers.Contract(request.contractAddress, ELECTION_CONTRACT_ABI, this.wallet);
      
      console.log('🔗 RealBlockchainService: Casting vote:', {
        contractAddress: request.contractAddress,
        candidateId: request.candidateId,
        voterAddress: request.voterAddress
      });

      // Convert candidateId to number (assuming it's a string)
      const candidateId = parseInt(request.candidateId);
      if (isNaN(candidateId)) {
        throw new Error('Invalid candidate ID');
      }
      
      const tx = await contract.vote(candidateId, {
        gasLimit: 150000
      });

      console.log('🔗 RealBlockchainService: Vote transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      
      console.log('🔗 RealBlockchainService: Vote cast successfully:', {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ RealBlockchainService: Failed to cast vote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Vote casting failed'
      };
    }
  }

  /**
   * Get election info from blockchain
   */
  async getElectionInfo(contractAddress: string) {
    try {
      if (!this.provider) {
        throw new Error('Blockchain provider not initialized');
      }

      const contract = new ethers.Contract(contractAddress, ELECTION_CONTRACT_ABI, this.provider);
      const electionInfo = await contract.getElectionInfo();
      
      console.log('🔗 RealBlockchainService: Election info retrieved:', electionInfo);
      
      return {
        success: true,
        data: {
          title: electionInfo.title,
          description: electionInfo.description,
          startTime: electionInfo.startTime.toString(),
          endTime: electionInfo.endTime.toString(),
          isActive: electionInfo.isActive,
          isFinalized: electionInfo.isFinalized
        }
      };
    } catch (error) {
      console.error('❌ RealBlockchainService: Failed to get election info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get election info'
      };
    }
  }

  /**
   * Check if voter is registered
   */
  async isVoterRegistered(contractAddress: string, voterAddress: string): Promise<boolean> {
    try {
      if (!this.provider) {
        throw new Error('Blockchain provider not initialized');
      }

      const contract = new ethers.Contract(contractAddress, ELECTION_CONTRACT_ABI, this.provider);
      const isRegistered = await contract.voters(voterAddress);
      
      console.log('🔗 RealBlockchainService: Voter registration status:', {
        voterAddress,
        isRegistered
      });
      
      return isRegistered;
    } catch (error) {
      console.error('❌ RealBlockchainService: Failed to check voter registration:', error);
      return false;
    }
  }

  /**
   * Check if voter has already voted
   */
  async hasVoterVoted(contractAddress: string, voterAddress: string): Promise<boolean> {
    try {
      if (!this.provider) {
        throw new Error('Blockchain provider not initialized');
      }

      const contract = new ethers.Contract(contractAddress, ELECTION_CONTRACT_ABI, this.provider);
      const hasVoted = await contract.voters(voterAddress); // This returns true if they've voted
      
      console.log('🔗 RealBlockchainService: Voter vote status:', {
        voterAddress,
        contractAddress,
        hasVoted
      });
      
      return hasVoted;
    } catch (error) {
      console.error('❌ RealBlockchainService: Failed to check voter vote status:', error);
      return false;
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(transactionHash: string) {
    try {
      if (!this.provider) {
        throw new Error('Blockchain provider not initialized');
      }

      const tx = await this.provider.getTransaction(transactionHash);
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      
      if (!tx || !receipt) {
        throw new Error('Transaction not found');
      }

      return {
        success: true,
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value.toString(),
          gasLimit: tx.gasLimit.toString(),
          gasPrice: tx.gasPrice?.toString(),
          nonce: tx.nonce,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          status: receipt.status === 1 ? 'success' : 'failed'
        }
      };
    } catch (error) {
      console.error('❌ RealBlockchainService: Failed to get transaction details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get transaction details'
      };
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNumber(): Promise<number> {
    try {
      if (!this.provider) {
        throw new Error('Blockchain provider not initialized');
      }

      const blockNumber = await this.provider.getBlockNumber();
      console.log('🔗 RealBlockchainService: Current block number:', blockNumber);
      return blockNumber;
    } catch (error) {
      console.error('❌ RealBlockchainService: Failed to get block number:', error);
      return 0;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Blockchain provider not initialized');
      }

      const balance = await this.provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);
      
      console.log('🔗 RealBlockchainService: Wallet balance:', {
        address,
        balance: balanceInEth,
        wei: balance.toString()
      });
      
      return balanceInEth;
    } catch (error) {
      console.error('❌ RealBlockchainService: Failed to get wallet balance:', error);
      return '0';
    }
  }
}

// Export singleton instance
export const realBlockchainService = new RealBlockchainService();
export default realBlockchainService;
