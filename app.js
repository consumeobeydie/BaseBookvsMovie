import { BrowserProvider, Contract, formatUnits } from 'https://esm.sh/ethers@6.13.4';

const CONFIG = {
  chainId: 8453,
  rpcUrl: 'https://mainnet.base.org',
  contractAddress: '0x407EacD1aAF2F46cC4079BFC4bef0c197A1FD6A8',
};

const CONTRACT_ABI = [
  'function vote(uint256 titleId, bool isBook) external',
  'function getVotes(uint256 titleId) external view returns (uint256 books, uint256 films)',
  'function canVote(uint256 titleId, address voter) external view returns (bool)',
  'function getAllVotes() external view returns (uint256[20] memory books, uint256[20] memory films)',
  'function balanceOf(address account) external view returns (uint256)',
];

const TITLES = [
  "Harry Potter Series", "The Lord of the Rings", "Dune", "Fight Club",
  "The Shining", "Schindler's List", "No Country for Old Men", "The Godfather",
  "A Clockwork Orange", "The Count of Monte Cristo", "Brave New World",
  "Perfume: The Story of a Murderer", "The Picture of Dorian Gray",
  "Anna Karenina", "The Great Gatsby", "The Reader", "Gone with the Wind",
  "All Quiet on the Western Front", "Forrest Gump", "The Handmaid's Tale"
];

const $ = (id) => document.getElementById(id);
const connectBtn = $('connect-btn');
const walletEl = $('wallet-address');
const balanceInfo = $('balance-info');
const csmBalance = $('csm-balance');
const statusEl = $('status');
const titlesContainer = $('titles-container');

let provider, signer, account, contract;

function setStatus(msg, type = '') {
  statusEl.textContent = msg;
  statusEl.className = `status${type ? ' ' + type : ''}`;
}

function shortAddress(addr) {
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

async function connectWallet() {
  connectBtn.textContent = 'Connecting…';
  connectBtn.disabled = true;
  setStatus('Connecting…');

  try {
    if (!window.ethereum) throw new Error('No wallet found. Install MetaMask.');

    let accounts = [];
    try { accounts = await window.ethereum.request({ method: 'eth_accounts' }); } catch {}
    if (!accounts || accounts.length === 0) {
      accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    if (!accounts || accounts.length === 0) throw new Error('No accounts found.');

    try {
      const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(chainHex, 16) !== CONFIG.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + CONFIG.chainId.toString(16) }]
          });
        } catch (e) {
          if (e.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x' + CONFIG.chainId.toString(16),
                chainName: 'Base',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: [CONFIG.rpcUrl],
                blockExplorerUrls: ['https://basescan.org']
              }]
            });
          }
        }
      }
    } catch {}

    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner(accounts[0]);
    account = accounts[0];
    contract = new Contract(CONFIG.contractAddress, CONTRACT_ABI, signer);

    walletEl.hidden = false;
    walletEl.textContent = shortAddress(account);
    connectBtn.textContent = 'Connected';
    connectBtn.disabled = true;
    balanceInfo.hidden = false;

    await refreshBalance();
    await renderTitles();
    setStatus('Wallet connected on Base.', 'success');

  } catch (err) {
    setStatus(err?.code === 4001 ? 'Connection rejected.' : (err.message || 'Connection failed.'), 'error');
    connectBtn.textContent = 'Connect Wallet';
    connectBtn.disabled = false;
  }
}

async function refreshBalance() {
  if (!contract || !account) return;
  try {
    const raw = await contract.balanceOf(account);
    csmBalance.textContent = Number(formatUnits(raw, 18)).toLocaleString('en-US', { maximumFractionDigits: 0 });
  } catch {}
}

async function renderTitles() {
  titlesContainer.innerHTML = '';

  let allVotes;
  try {
    const [booksArr, filmsArr] = await contract.getAllVotes();
    allVotes = { books: booksArr, films: filmsArr };
  } catch {
    allVotes = { books: Array(20).fill(0), films: Array(20).fill(0) };
  }

  const canVoteList = await Promise.all(
    TITLES.map((_, i) => contract.canVote(i, account).catch(() => true))
  );

  TITLES.forEach((title, i) => {
    const books = Number(allVotes.books[i]);
    const films = Number(allVotes.films[i]);
    const total = books + films;
    const bookPct = total > 0 ? Math.round((books / total) * 100) : 50;
    const filmPct = total > 0 ? Math.round((films / total) * 100) : 50;
    const canVoteNow = canVoteList[i];

    const card = document.createElement('div');
    card.className = 'title-card';
    card.innerHTML = `
      <div class="title-name">${title}</div>
      <div class="vote-buttons">
        <button class="vote-btn book" data-id="${i}" data-isbook="true" ${!canVoteNow ? 'disabled' : ''}>
          📚 Book ${canVoteNow ? '(+100 CSM)' : ''}
        </button>
        <button class="vote-btn film" data-id="${i}" data-isbook="false" ${!canVoteNow ? 'disabled' : ''}>
          🎬 Film ${canVoteNow ? '(+100 CSM)' : ''}
        </button>
      </div>
      <div class="vote-stats">
        <div class="stat">📚 <span>${bookPct}%</span>${books} votes</div>
        <div class="stat">🎬 <span>${filmPct}%</span>${films} votes</div>
      </div>
      ${!canVoteNow ? '<div class="voted-badge">✓ Voted today — come back tomorrow</div>' : ''}
    `;
    titlesContainer.appendChild(card);
  });

  titlesContainer.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const titleId = parseInt(btn.dataset.id);
      const isBook = btn.dataset.isbook === 'true';
      void submitVote(titleId, isBook);
    });
  });
}

async function submitVote(titleId, isBook) {
  if (!contract || !account) return;
  const btns = titlesContainer.querySelectorAll('.vote-btn');
  btns.forEach(b => b.disabled = true);
  setStatus('Confirm the transaction in your wallet…');
  try {
    const tx = await contract.vote(titleId, isBook);
    setStatus('Transaction submitted. Waiting for confirmation…');
    await tx.wait();
    setStatus('Successfully voted! +100 CSM earned 🎉', 'success');
    await refreshBalance();
    await renderTitles();
  } catch (err) {
    setStatus(err.reason || err.message || 'Vote failed.', 'error');
    await renderTitles();
  }
}

connectBtn.addEventListener('click', connectWallet);