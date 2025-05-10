"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1C1F37]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] mx-4 bg-white rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#B4D335]" />
        <div className="px-6 py-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-[#B4D335] rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold text-[#1C1F37] mb-2"
            >
              Thank You!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-6"
            >
              Your feedback has been submitted successfully. We appreciate your time and input.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#B4D335] text-white rounded-lg hover:bg-[#9BB82B] transition-colors duration-200 font-medium"
              >
                Return Home
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 