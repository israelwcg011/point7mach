<template>
  <div v-if="trip">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center mb-4">
          <NuxtLink to="/" class="text-indigo-600 hover:text-indigo-800 mr-4">
            &larr; Back
          </NuxtLink>
          <span class="text-gray-400">|</span>
          <span class="ml-4 text-sm text-gray-500">{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</span>
        </div>
        <div class="flex justify-between items-end">
          <div>
            <div class="flex items-center gap-4">
              <h1 class="text-3xl font-bold text-gray-900">
                {{ trip.title }}
              </h1>
              <button
                v-if="isTripOwner"
                @click="showEditTripModal = true"
                class="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-all duration-200 border border-indigo-200 hover:border-indigo-300 shadow-sm hover:shadow"
              >
                Edit Trip
              </button>
              <span
                v-else
                class="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-md border border-gray-200"
              >
                Read Only
              </span>
            </div>
            <p class="text-lg text-gray-600 flex items-center mt-1">
              <span class="mr-2">📍</span> {{ trip.destination }}
            </p>
          </div>
          <div class="text-right flex flex-col items-end gap-4">
            <div class="flex gap-3">
              <NuxtLink
                :to="`/trips/${tripId}/album`"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 no-print"
              >
                <span class="mr-2">📸</span>
                View Photo Album
              </NuxtLink>
              <button 
                @click="handlePrint" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 no-print"
              >
                <span class="mr-2">📄</span>
                Generate PDF
              </button>
            </div>
            <div>
              <p class="text-sm text-gray-500">Total Cost</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalCost, trip.currency) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          @click="activeTab = 'expenses'"
          :class="[
            activeTab === 'expenses'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Expenses
        </button>
        <button
          @click="activeTab = 'statistics'"
          :class="[
            activeTab === 'statistics'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Statistics
        </button>
      </nav>
    </div>

    <!-- Content -->
    <div v-if="activeTab === 'expenses'">
      <div class="bg-white shadow rounded-lg overflow-hidden transition-all duration-300 ease-in-out">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">All Expenses</h3>
          <button 
            v-if="isTripOwner"
            @click="showAddModal = true"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <span>+</span> Add Expense
          </button>
        </div>
        <div class="border-t border-gray-200">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-if="expenses.length === 0" class="px-4 py-16 sm:px-6 text-center text-gray-500 flex flex-col items-center justify-center">
              <div class="bg-gray-100 p-4 rounded-full mb-3">
                <span class="text-3xl">💸</span>
              </div>
              <p class="text-lg font-medium text-gray-900">No expenses recorded yet</p>
              <p class="text-sm mt-1 max-w-sm mx-auto">Start tracking your spending by adding your first expense to this trip.</p>
              <button 
                @click="showAddModal = true"
                class="mt-4 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
              >
                Add your first expense &rarr;
              </button>
            </li>
            <TransitionGroup name="list">
              <li v-for="expense in expenses" :key="expense.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors group">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl ring-1 ring-indigo-100">
                      {{ getCategoryIcon(expense.category) }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 truncate">{{ expense.description }}</div>
                      <div v-if="expense.date" class="text-xs text-gray-500 mt-0.5">{{ formatDate(expense.date) }}</div>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <div class="ml-2 flex-shrink-0 flex flex-col items-end mr-4">
                      <span class="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize mb-1">
                        {{ expense.category }}
                      </span>
                      <span class="text-sm font-bold text-gray-900">
                        {{ formatCurrency(expense.amount, expense.currency) }}
                      </span>
                    </div>
                    <div v-if="isTripOwner" class="flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button 
                        @click="handleEditExpense(expense)"
                        class="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 hover:border-indigo-300 transition-all duration-150 shadow-sm hover:shadow"
                      >
                        Edit
                      </button>
                      <button 
                        @click="handleDeleteExpense(expense.id)"
                        class="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 hover:border-red-300 transition-all duration-150 shadow-sm hover:shadow"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </TransitionGroup>
          </ul>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'statistics'">
      <ExpenseStatistics :trip="trip" :expenses="expenses" />
    </div>

    <ConfirmModal
      :isOpen="showDeleteConfirm"
      title="Delete Expense"
      message="Are you sure you want to delete this expense? This action cannot be undone."
      confirmText="Delete"
      @confirm="confirmDeleteExpense"
      @close="showDeleteConfirm = false"
    />

    <AddExpenseModal 
      v-if="showAddModal" 
      :tripId="trip.id" 
      :defaultCurrency="trip.currency"
      :tripStartDate="trip.startDate"
      :tripEndDate="trip.endDate"
      @close="showAddModal = false"
      @add="handleAddExpense"
    />

    <EditTripModal
      v-if="showEditTripModal && trip"
      :trip="trip"
      @update="handleUpdateTrip"
      @close="showEditTripModal = false"
    />

    <EditExpenseModal
      v-if="showEditExpenseModal && expenseToEdit"
      :expense="expenseToEdit"
      :tripStartDate="trip.startDate"
      :tripEndDate="trip.endDate"
      @update="handleUpdateExpense"
      @close="showEditExpenseModal = false; expenseToEdit = null"
    />
  </div>
  <div v-else class="text-center py-20">
    <p class="text-gray-500">Trip not found.</p>
    <NuxtLink to="/" class="text-indigo-600 hover:underline mt-2 inline-block">Go back home</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { formatDate, formatCurrency } from '~/utils/format'
import type { Expense, ActivityCategory } from '~/types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const route = useRoute()
const { getTrip, getTripExpenses, addExpense, deleteExpense, updateTrip, updateExpense, loadTripData } = useTravelData()
const { isOwner } = useTripOwnership()

const tripId = route.params.id as string
const trip = computed(() => getTrip(tripId))
const expenses = getTripExpenses(tripId)
const isTripOwner = computed(() => isOwner(trip.value))

// Load trip data on mount if not already loaded
onMounted(async () => {
  if (!trip.value) {
    await loadTripData(tripId)
  }
})

const totalCost = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + expense.amount, 0)
})

const activeTab = ref('expenses')
const showAddModal = ref(false)
const showEditTripModal = ref(false)
const showEditExpenseModal = ref(false)
const showDeleteConfirm = ref(false)
const expenseToDelete = ref<string | null>(null)
const expenseToEdit = ref<Expense | null>(null)

const handlePrint = async () => {
  if (!trip.value) return
  
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 20
  
  // Page 1: Header and Statistics
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(trip.value.title, 14, yPos)
  yPos += 10
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(trip.value.destination, 14, yPos)
  yPos += 7
  
  doc.text(`${formatDate(trip.value.startDate)} - ${formatDate(trip.value.endDate)}`, 14, yPos)
  yPos += 10
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(79, 70, 229)
  doc.text(`Total Cost: ${formatCurrency(totalCost.value, trip.value.currency)}`, 14, yPos)
  yPos += 15
  
  // Statistics Section
  doc.setFontSize(18)
  doc.setTextColor(0)
  doc.text('Trip Statistics', 14, yPos)
  yPos += 10
  
  // Category breakdown
  const categoryTotals = expenses.value.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  // Calculate months until trip
  const startDate = new Date(trip.value.startDate)
  const today = new Date()
  const monthsUntilTrip = Math.max(1, Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)))
  const monthlySavings = totalCost.value / monthsUntilTrip
  
  // Total Cost card
  doc.setFillColor(243, 244, 246)
  doc.rect(14, yPos, 60, 20, 'F')
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text('Total Cost', 17, yPos + 7)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text(formatCurrency(totalCost.value, trip.value.currency), 17, yPos + 15)
  
  // Budget card
  doc.setFillColor(243, 244, 246)
  doc.rect(80, yPos, 60, 20, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text('Est. Budget (+10%)', 83, yPos + 7)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(79, 70, 229)
  const budget = totalCost.value * 1.1
  doc.text(formatCurrency(budget, trip.value.currency), 83, yPos + 15)
  
  // Monthly Savings card
  doc.setFillColor(243, 244, 246)
  doc.rect(146, yPos, 60, 20, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text(`Monthly Savings`, 149, yPos + 5)
  doc.text(`for ${monthsUntilTrip} months`, 149, yPos + 10)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(34, 197, 94)
  doc.text(formatCurrency(monthlySavings, trip.value.currency), 149, yPos + 17)
  
  yPos += 30
  
  // Spending by category
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Spending by Category', 14, yPos)
  yPos += 8
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    const percentage = (amount / totalCost.value) * 100
    doc.setTextColor(75, 85, 99)
    doc.text(category.charAt(0).toUpperCase() + category.slice(1), 14, yPos)
    doc.setTextColor(0)
    doc.text(formatCurrency(amount, trip.value.currency), pageWidth - 50, yPos)
    doc.setTextColor(107, 114, 128)
    doc.text(`${percentage.toFixed(1)}%`, pageWidth - 20, yPos)
    yPos += 7
  })
  
  // Page 2: Expenses Table
  doc.addPage()
  yPos = 20
  
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text('Expense Details', 14, yPos)
  yPos += 10
  
  // Create expenses table
  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Description', 'Category', 'Amount']],
    body: expenses.value.map(e => [
      formatDate(e.date),
      e.description,
      e.category.charAt(0).toUpperCase() + e.category.slice(1),
      formatCurrency(e.amount, e.currency)
    ]),
    foot: [[{ content: 'Total', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, formatCurrency(totalCost.value, trip.value.currency)]],
    theme: 'striped',
    headStyles: { 
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    footStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [79, 70, 229]
    },
    styles: { 
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { top: 20, left: 14, right: 14 }
  })
  
  // Footer on last page
  const finalY = (doc as any).lastAutoTable.finalY || yPos
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )
  
  // Open PDF in new tab with print/download options
  const pdfBlob = doc.output('blob')
  const url = URL.createObjectURL(pdfBlob)
  window.open(url, '_blank')
}

const handleUpdateTrip = async (updatedTrip: any) => {
  try {
    const { pictureFile, removePicture, ...updates } = updatedTrip
    await updateTrip(tripId, updates, pictureFile, removePicture)
    showEditTripModal.value = false
  } catch (error) {
    alert('Failed to update trip. Please check your connection and try again.')
  }
}

const handleEditExpense = (expense: Expense) => {
  expenseToEdit.value = expense
  showEditExpenseModal.value = true
}

const handleUpdateExpense = async (updatedExpense: Partial<Omit<Expense, 'id' | 'tripId'>>) => {
  if (expenseToEdit.value) {
    try {
      await updateExpense(tripId, expenseToEdit.value.id, updatedExpense)
      showEditExpenseModal.value = false
      expenseToEdit.value = null
    } catch (error) {
      alert('Failed to update expense. Please check your connection and try again.')
    }
  }
}

const handleAddExpense = async (expense: Expense) => {
  try {
    await addExpense(expense)
  } catch (error) {
    alert('Failed to add expense. Please check your connection and try again.')
  }
}

const handleDeleteExpense = (expenseId: string) => {
  expenseToDelete.value = expenseId
  showDeleteConfirm.value = true
}

const confirmDeleteExpense = async () => {
  if (expenseToDelete.value) {
    try {
      await deleteExpense(tripId, expenseToDelete.value)
      expenseToDelete.value = null
      showDeleteConfirm.value = false
    } catch (error) {
      alert('Failed to delete expense. Please check your connection and try again.')
    }
  }
}

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
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}


#print-view table {
  border: 1px solid #e5e7eb;
}

#print-view th {
  font-weight: 600;
}

.print-page-1 {
  page-break-after: always;
}

.statistics-page {
  min-height: 60vh;
}

/* Print styles */
@media print {
  /* Reset page margins */
  @page {
    margin: 1.5cm;
  }
  
  /* Hide all screen content - very specific targeting */
  body > div:not(#print-view),
  .bg-white.shadow-sm,
  .border-b.border-gray-200.mb-6,
  .bg-white.shadow.rounded-lg,
  nav,
  .no-print,
  button,
  a[href],
  ul[role="list"],
  .px-4.py-5.sm\\:px-6 {
    display: none !important;
  }
  
  /* Hide the entire main page structure except print-view */
  body > div > div:not(#print-view),
  body > div > div > div:not(#print-view) {
    display: none !important;
  }
  
  /* Show only print view */
  #print-view {
    display: block !important;
    visibility: visible !important;
    position: static !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }
  
  #print-view,
  #print-view *,
  #print-view table,
  #print-view th,
  #print-view td,
  #print-view h1,
  #print-view h2,
  #print-view p,
  #print-view section,
  #print-view header,
  #print-view footer {
    display: revert !important;
    visibility: visible !important;
  }
  
  /* Force page breaks */
  .print-page-1 {
    page-break-after: always !important;
  }
  
  .print-page-2 {
    page-break-before: always !important;
  }
  
  /* Prevent page breaks inside elements */
  h1, h2, h3 {
    page-break-after: avoid !important;
  }
  
  table {
    page-break-inside: auto !important;
    display: table !important;
  }
  
  thead {
    display: table-header-group !important;
  }
  
  tbody {
    display: table-row-group !important;
  }
  
  tfoot {
    display: table-footer-group !important;
  }
  
  tr {
    page-break-inside: avoid !important;
    page-break-after: auto !important;
    display: table-row !important;
  }
  
  td, th {
    display: table-cell !important;
  }
  
  /* Ensure colors print correctly */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}





</style>
