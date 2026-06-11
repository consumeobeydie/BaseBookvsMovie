"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect } from "react";
import { base } from "wagmi/chains";

const CONTRACT_ADDRESS = "0x407EacD1aAF2F46cC4079BFC4bef0c197A1FD6A8" as const;

const ABI = [
  {
    name: "vote",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "titleId", type: "uint256" },
      { name: "isBook", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "canVote",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "titleId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getAllVotes",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "books", type: "uint256[20]" },
      { name: "films", type: "uint256[20]" },
    ],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const TITLES = [
  "Harry Potter Series", "The Lord of the Rings", "Dune", "Fight Club",
  "The Shining", "Schindler's List", "No Country for Old Men", "The Godfather",
  "A Clockwork Orange", "The Count of Monte Cristo", "Brave New World",
  "Perfume: The Story of a Murderer", "The Picture of Dorian Gray",
  "Anna Karenina", "The Great Gatsby", "The Reader", "Gone with the Wind",
  "All Quiet on the Western Front", "Forrest Gump", "The Handmaid's Tale"
];

function TitleCard({ 
  titleId, 
  title, 
  address,
  books,
  films,
}: { 
  titleId: number; 
  title: string; 
  address: string;
  books: bigint;
  films: bigint;
}) {
  const { data: canVote } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "canVote",
    args: [BigInt(titleId), address as `0x${string}`],
    chainId: base.id,
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const booksNum = Number(books);
  const filmsNum = Number(films);
  const total = booksNum + filmsNum;
  const bookPct = total > 0 ? Math.round((booksNum / total) * 100) : 50;
  const filmPct = 100 - bookPct;

  const voted = isSuccess || !canVote;

  return (
    <div className="bg-[#12121f] border border-[#1e1e2e] rounded-xl p-4 mb-3">
      <p className="font-semibold text-sm mb-3">{title}</p>
      
      {!voted ? (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            disabled={isPending || isConfirming}
            onClick={() => writeContract({
              address: CONTRACT_ADDRESS,
              abi: ABI,
              functionName: "vote",
              args: [BigInt(titleId), true],
              chainId: base.id,
            })}
            className="bg-[#1a3a5c] text-[#4fc3f7] font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50"
          >
            📚 Book (+100 CSM)
          </button>
          <button
            disabled={isPending || isConfirming}
            onClick={() => writeContract({
              address: CONTRACT_ADDRESS,
              abi: ABI,
              functionName: "vote",
              args: [BigInt(titleId), false],
              chainId: base.id,
            })}
            className="bg-[#3a1a5c] text-[#ce93d8] font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50"
          >
            🎬 Film (+100 CSM)
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-500 mb-3">
          {isSuccess ? "✓ Vote confirmed!" : "✓ Voted today — come back tomorrow"}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-500">
        <div className="bg-[#0a0a0f] rounded-lg p-2">
          📚 <span className="text-white font-bold">{bookPct}%</span> {booksNum} votes
        </div>
        <div className="bg-[#0a0a0f] rounded-lg p-2">
          🎬 <span className="text-white font-bold">{filmPct}%</span> {filmsNum} votes
        </div>
      </div>
    </div>
  );
}

export function VoteList({ address }: { address: string }) {
  const { data: allVotes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllVotes",
    chainId: base.id,
  });

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    chainId: base.id,
  });

  const books = allVotes?.[0] ?? Array(20).fill(0n);
  const films = allVotes?.[1] ?? Array(20).fill(0n);
  const csmBalance = balance ? Number(balance) / 1e18 : 0;

  return (
    <div>
      <div className="bg-[#12121f] border border-[#1e1e2e] rounded-xl p-4 mb-4 text-center">
        <p className="text-xs text-gray-400">Your CSM Balance</p>
        <p className="text-2xl font-bold text-cyan-400">
          {csmBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })} CSM
        </p>
      </div>

      {TITLES.map((title, i) => (
        <TitleCard
          key={i}
          titleId={i}
          title={title}
          address={address}
          books={books[i] as bigint}
          films={films[i] as bigint}
        />
      ))}
    </div>
  );
}