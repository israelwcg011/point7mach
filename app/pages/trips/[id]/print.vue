<template>
  <div v-if="trip" class="print-container">
    <!-- Header -->
    <header class="print-header">
      <h1>{{ trip.title }}</h1>
      <div class="header-info">
        <p class="destination">📍 {{ trip.destination }}</p>
        <p class="dates">{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</p>
        <p class="total-cost">Total Cost: {{ formatCurrency(totalCost, trip.currency) }}</p>
      </div>
    </header>

    <!-- Statistics Section -->
    <section class="statistics-section">
      <h2>Trip Statistics</h2>
      <ExpenseStatistics :trip="trip" :expenses="expenses" />
    </section>

    <!-- Expenses Table -->
    <section class="expenses-section">
      <h2>Expense Details</h2>
      <table class="expenses-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenses" :key="expense.id">
            <td class="date-cell">{{ formatDate(expense.date) }}</td>
            <td>{{ expense.description }}</td>
            <td class="category-cell">
              <span class="category-badge">{{ getCategoryIcon(expense.category) }} {{ expense.category }}</span>
            </td>
            <td class="amount-cell text-right">{{ formatCurrency(expense.amount, expense.currency) }}</td>
          </tr>
        </tbody>
        <tfoot v-if="expenses.length > 0">
          <tr>
            <td colspan="3" class="text-right"><strong>Total:</strong></td>
            <td class="text-right"><strong>{{ formatCurrency(totalCost, trip.currency) }}</strong></td>
          </tr>
        </tfoot>
      </table>
      <p v-if="expenses.length === 0" class="no-expenses">No expenses recorded for this trip.</p>
    </section>

    <!-- Footer -->
    <footer class="print-footer">
      <p>Generated on {{ new Date().toLocaleDateString() }} at {{ new Date().toLocaleTimeString() }}</p>
    </footer>

    <!-- Print Button (hidden when printing) -->
    <div class="print-actions no-print">
      <button @click="print" class="btn-print">🖨️ Print / Save as PDF</button>
      <button @click="close" class="btn-close">Close</button>
    </div>
  </div>
  <div v-else-if="isLoading" class="loading">
    <div class="loading-spinner">
      <svg class="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    <p class="mt-4">Loading trip data...</p>
  </div>
  <div v-else class="loading">
    <p>Trip not found or you don't have permission to view it.</p>
    <button @click="close" class="mt-4 btn-close">Close Window</button>
  </div>
</template>

<script setup lang="ts">
import { formatDate, formatCurrency } from '~/utils/format'
import type { ActivityCategory, Trip, Expense } from '~/types'

definePageMeta({
  layout: false // Disable default layout for print page
})

const route = useRoute()
const user = useFirebaseUser()
const { getTrip, getTripExpenses } = useTravelData()

const tripId = route.params.id as string
const trip = ref<Trip | null>(null)
const expenses = ref<Expense[]>([])
const isLoading = ref(true)

const totalCost = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + expense.amount, 0)
})

const getCategoryIcon = (category: ActivityCategory) => {
  switch (category) {
    case 'transport': return '✈️'
    case 'accommodation': return '🏨'
    case 'food': return '🍽️'
    case 'sightseeing': return '📸'
    case 'shopping': return '🛍️'
    default: return '💸'
  }
}

const print = () => {
  window.print()
}

const close = () => {
  window.close()
}

// Fetch trip and expenses data
const loadData = async () => {
  console.log('Starting loadData...')
  console.log('User:', user.value)
  console.log('Trip ID:', tripId)
  
  if (!user.value) {
    console.error('No user found, waiting for auth...')
    // Wait a bit for auth to initialize
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (!user.value) {
      console.error('Still no user after waiting')
      isLoading.value = false
      return
    }
  }

  try {
    console.log('Fetching trip data...')
    
    // Get trip data
    const tripData = getTrip(tripId)
    if (tripData) {
      trip.value = tripData
      console.log('Trip loaded:', trip.value.title)
    } else {
      console.error('Trip not found')
      isLoading.value = false
      return
    }

    console.log('Fetching expenses...')
    
    // Get expenses data
    const tripExpensesComputed = getTripExpenses(tripId)
    expenses.value = tripExpensesComputed.value
    console.log('Expenses loaded:', expenses.value.length)

    isLoading.value = false
    console.log('Data loading complete')

    // Trigger print dialog after data is loaded
    await nextTick()
    setTimeout(() => {
      console.log('Opening print dialog...')
      window.print()
    }, 500)
  } catch (error) {
    console.error('Error loading data:', error)
    isLoading.value = false
  }
}

// Load data when component mounts
onMounted(() => {
  console.log('Component mounted')
  loadData()
})
</script>

<style scoped>
.print-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  color: #1f2937;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.print-header {
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid #4f46e5;
}

.print-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.header-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 1rem;
  color: #4b5563;
}

.destination {
  font-size: 1.125rem;
  font-weight: 500;
}

.dates {
  color: #6b7280;
}

.total-cost {
  font-size: 1.25rem;
  font-weight: bold;
  color: #4f46e5;
  margin-left: auto;
}

.statistics-section {
  margin-bottom: 3rem;
  page-break-inside: avoid;
}

.statistics-section h2,
.expenses-section h2 {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1.5rem;
  padding-left: 0.75rem;
  border-left: 4px solid #4f46e5;
}

.expenses-section {
  margin-bottom: 2rem;
}

.expenses-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.expenses-table th {
  background-color: #4f46e5;
  color: white;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.expenses-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
}

.expenses-table tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

.expenses-table td {
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
}

.date-cell {
  color: #6b7280;
  white-space: nowrap;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.amount-cell {
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
}

.expenses-table tfoot tr {
  border-top: 2px solid #4f46e5;
  background-color: #f3f4f6;
}

.expenses-table tfoot td {
  padding: 1rem;
  font-size: 1.125rem;
}

.text-right {
  text-align: right;
}

.no-expenses {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  font-size: 1.125rem;
}

.print-footer {
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.print-actions {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 1000;
}

.btn-print,
.btn-close {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-print {
  background-color: #4f46e5;
  color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.btn-print:hover {
  background-color: #4338ca;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-close {
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-close:hover {
  background-color: #f9fafb;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 1.125rem;
  color: #6b7280;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Print-specific styles */
@media print {
  .print-container {
    padding: 0;
    max-width: 100%;
  }

  .no-print {
    display: none !important;
  }

  .print-header {
    page-break-after: avoid;
  }

  .statistics-section {
    page-break-inside: avoid;
  }

  .expenses-table {
    page-break-inside: auto;
  }

  .expenses-table tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  .expenses-table thead {
    display: table-header-group;
  }

  .expenses-table tfoot {
    display: table-footer-group;
  }

  /* Ensure good print quality */
  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
