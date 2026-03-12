"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { ArrowRight } from "lucide-react";

export function DashboardScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1C1917] dark:text-[#FAF9F7] mb-4">
              Your Complete Training Hub
            </h2>
            <p className="text-lg md:text-xl text-[#78716C] dark:text-[#A8A29E] max-w-3xl mx-auto">
              Manage categories, lessons, users, and analytics all in one beautiful, intuitive dashboard. Watch your training program come to life.
            </p>
          </>
        }
      >
        <div className="w-full h-full bg-[#F5F3F0] rounded-lg overflow-hidden flex flex-col">
          {/* Dashboard Header */}
          <div className="bg-[#1C1917] px-6 py-3 flex items-center justify-between border-b border-[#FF6B35]/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-[#FAF9F7] font-semibold">Training Management System</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#2A2622] rounded-full">
                <svg className="w-4 h-4 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search..." className="bg-transparent text-[#FAF9F7] text-sm placeholder-[#78716C] outline-none w-32" />
              </div>
              <div className="w-8 h-8 bg-[#FF6B35]/20 rounded-full flex items-center justify-center text-[#FF6B35] text-sm font-bold">3</div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              {[
                { label: "Total Categories", value: "12", icon: "📁", color: "#FF6B35" },
                { label: "Total Lessons", value: "58", icon: "📹", color: "#FF8A50" },
                { label: "Active Users", value: "125", icon: "👥", color: "#FFA070" },
                { label: "Files Uploaded", value: "342", icon: "📦", color: "#FFB88F" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-3 md:p-4 border border-[#E8E3DF] hover:border-[#FF6B35]/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <div className="w-10 h-10 rounded-full border-2" style={{ borderColor: stat.color, opacity: 0.3 }} />
                  </div>
                  <p className="text-xs text-[#A8A29E] mb-1">{stat.label}</p>
                  <p className="text-lg md:text-xl font-bold text-[#1C1917]">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Category & User Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Categories */}
              <div className="bg-white rounded-lg p-4 border border-[#E8E3DF]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#1C1917]">Category Management</h3>
                  <button className="px-3 py-1 bg-[#FF6B35] text-white text-xs rounded-lg hover:bg-[#E85A24] transition-colors">
                    Add Category
                  </button>
                </div>
                <div className="space-y-2">
                  {["Website Tutorials", "Shop Training", "HR Onboarding"].map((cat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F5F3F0] rounded hover:bg-[#EEE9E3] transition-colors">
                      <span className="text-sm text-[#1C1917]">{cat}</span>
                      <span className="text-xs text-[#A8A29E]">{12 + i * 5} lessons</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users */}
              <div className="bg-white rounded-lg p-4 border border-[#E8E3DF]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#1C1917]">Users & Roles</h3>
                  <button className="px-3 py-1 bg-[#FF6B35] text-white text-xs rounded-lg hover:bg-[#E85A24] transition-colors">
                    Add User
                  </button>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "John Manager", role: "Manager", status: "Active" },
                    { name: "Lisa Taylor", role: "Employee", status: "Inactive" },
                    { name: "David Board", role: "Board Member", status: "Active" },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F5F3F0] rounded hover:bg-[#EEE9E3] transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1C1917]">{user.name}</p>
                        <p className="text-xs text-[#A8A29E]">{user.role}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          user.status === "Active"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#FF6B35]/10 text-[#FF6B35]"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Files & AI Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border border-[#E8E3DF]">
                <h3 className="font-semibold text-[#1C1917] mb-4">Content Library</h3>
                <div className="space-y-2">
                  {[
                    { name: "Website Guide.pdf", type: "Document" },
                    { name: "Video Demo.mp4", type: "Video" },
                    { name: "Audio Tutorial.mp3", type: "Audio" },
                  ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F5F3F0] rounded hover:bg-[#EEE9E3] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {file.type === "Document" ? "📄" : file.type === "Video" ? "🎬" : "🎵"}
                        </span>
                        <div>
                          <p className="text-sm text-[#1C1917]">{file.name}</p>
                          <p className="text-xs text-[#A8A29E]">{file.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-[#E8E3DF]">
                <h3 className="font-semibold text-[#1C1917] mb-4">AI Search Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#F5F3F0] rounded">
                    <label className="text-sm text-[#1C1917]">Enable AI Search</label>
                    <input type="checkbox" checked readOnly className="w-4 h-4 accent-[#FF6B35]" />
                  </div>
                  <div className="p-3 bg-[#F5F3F0] rounded">
                    <p className="text-xs text-[#A8A29E] mb-2">AI Model</p>
                    <select className="w-full text-sm px-2 py-1 border border-[#E8E3DF] rounded bg-white text-[#1C1917]">
                      <option>OpenAI GPT-3.5</option>
                    </select>
                  </div>
                  <button className="w-full px-4 py-2 bg-[#FF6B35] text-white text-sm rounded-lg hover:bg-[#E85A24] transition-colors flex items-center justify-center gap-2">
                    Update Settings
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
