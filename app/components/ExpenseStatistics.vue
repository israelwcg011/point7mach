<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
          <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ formatCurrency(totalSpent, trip.currency) }}</dd>
        </div>
      </div>
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Est. Budget (+10%)</dt>
          <dd class="mt-1 text-2xl font-semibold text-indigo-600">{{ formatCurrency(estimatedBudget, trip.currency) }}</dd>
        </div>
      </div>
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Monthly Savings</dt>
          <dd class="mt-1 text-2xl font-semibold text-green-600">
            {{ monthsToSave > 0 ? formatCurrency(monthlySavings, trip.currency) : 'N/A' }}
            <span v-if="monthsToSave > 0" class="text-xs text-gray-400 font-normal block mt-1">for {{ monthsToSave }} month{{ monthsToSave !== 1 ? 's' : '' }}</span>
          </dd>
        </div>
      </div>
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Highest Category</dt>
          <dd class="mt-1 text-xl font-semibold text-gray-900 truncate">{{ highestCategory }}</dd>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Category Breakdown List -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Spending by Category</h3>
        <div class="space-y-4">
          <div v-for="(amount, category) in spendingByCategory" :key="category" class="flex items-center">
            <div class="w-32 text-sm font-medium text-gray-500 capitalize">{{ category }}</div>
            <div class="flex-1 mx-4">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-indigo-500 h-2 rounded-full" 
                  :style="{ width: totalSpent > 0 ? `${(amount / totalSpent) * 100}%` : '0%' }"
                ></div>
              </div>
            </div>
            <div class="w-24 text-right text-sm font-bold text-gray-900">{{ formatCurrency(amount, trip.currency) }}</div>
          </div>
        </div>
      </div>

      <!-- Pie Chart -->
      <div class="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4 w-full text-left">Distribution</h3>
        <div class="w-full max-w-xs h-64 relative">
          <Pie v-if="totalSpent > 0" :data="chartData" :options="chartOptions" />
          <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
            No data to display
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Trip, Expense } from '~/types'
import { formatCurrency } from '~/utils/format'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  trip: Trip
  expenses: Expense[]
}>()

const totalSpent = computed(() => {
  return props.expenses.reduce((sum, expense) => sum + expense.amount, 0)
})

const estimatedBudget = computed(() => {
  return totalSpent.value * 1.10
})

const monthsToSave = computed(() => {
  if (!props.trip.startDate) return 0
  
  const now = new Date()
  const start = new Date(props.trip.startDate)
  
  // Calculate months difference: (Year2 - Year1) * 12 + (Month2 - Month1)
  // We want the month BEFORE the trip starts.
  // Example: Now = Jan 2026, Trip = Feb 2026.
  // Diff in months = 1.
  // If Trip = Jan 2026, Diff = 0.
  
  let months = (start.getFullYear() - now.getFullYear()) * 12 + (start.getMonth() - now.getMonth())
  
  // If the trip is in the future, we count the current month as a saving month.
  // If trip is Feb 10, we save in Jan. (1 month).
  // If trip is June 15, we save Jan, Feb, Mar, Apr, May. (5 months).
  
  return Math.max(0, months)
})

const monthlySavings = computed(() => {
  if (monthsToSave.value <= 0) return 0
  return estimatedBudget.value / monthsToSave.value
})

const spendingByCategory = computed(() => {
  const breakdown: Record<string, number> = {}
  props.expenses.forEach(expense => {
    breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount
  })
  return breakdown
})

const highestCategory = computed(() => {
  let max = 0
  let category = '-'
  const breakdown = spendingByCategory.value
  for (const [cat, amount] of Object.entries(breakdown)) {
    if (amount > max) {
      max = amount
      category = cat
    }
  }
  return category.charAt(0).toUpperCase() + category.slice(1)
})

const chartData = computed(() => {
  const labels = Object.keys(spendingByCategory.value).map(c => c.charAt(0).toUpperCase() + c.slice(1))
  const data = Object.values(spendingByCategory.value)
  
  return {
    labels,
    datasets: [
      {
        backgroundColor: [
          '#6366f1', // Indigo 500
          '#ec4899', // Pink 500
          '#10b981', // Emerald 500
          '#f59e0b', // Amber 500
          '#8b5cf6', // Violet 500
          '#6b7280'  // Gray 500
        ],
        data
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}
</script>
