<template>
  <TransitionRoot as="template" :show="true">
    <Dialog as="div" class="fixed z-10 inset-0 overflow-y-auto" @close="$emit('close')">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                <span class="text-2xl">💸</span>
              </div>
              <div class="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                  Add New Expense
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Track your spending to keep your trip within budget.
                  </p>
                </div>
              </div>
            </div>
            <form @submit.prevent="handleSubmit" class="mt-5 sm:mt-6 space-y-4">
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                <div class="mt-1">
                  <input type="text" id="description" v-model="form.description" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. Train Ticket">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input type="number" id="amount" v-model.number="form.amount" required min="0" step="0.01" class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2" placeholder="0.00">
                  </div>
                </div>
                <div>
                  <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
                  <select id="currency" v-model="form.currency" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option v-for="curr in currencies" :key="curr" :value="curr">{{ curr }}</option>
                  </select>
                </div>
              </div>

              <div>
                <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                <select id="category" v-model="form.category" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="transport">✈️ Transport</option>
                  <option value="accommodation">🏨 Accommodation</option>
                  <option value="food">🍽️ Food</option>
                  <option value="sightseeing">📸 Sightseeing</option>
                  <option value="shopping">🛍️ Shopping</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              <div>
                <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
                <div class="mt-1">
                  <input 
                    type="date" 
                    id="date" 
                    v-model="form.date" 
                    :min="tripStartDate" 
                    :max="tripEndDate"
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                </div>
                <p v-if="tripStartDate && tripEndDate" class="mt-1 text-xs text-gray-500">Date must be between {{ formatDate(tripStartDate) }} and {{ formatDate(tripEndDate) }}</p>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm">
                  Add Expense
                </button>
                <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm" @click="$emit('close')">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogOverlay, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { Expense, ActivityCategory, Currency } from '~/types'

const props = defineProps<{
  tripId: string
  defaultCurrency: Currency
  tripStartDate?: string
  tripEndDate?: string
}>()

const emit = defineEmits(['close', 'add'])

const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD', 'BRL']

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const form = reactive({
  description: '',
  amount: 0,
  currency: props.defaultCurrency,
  category: 'food' as ActivityCategory,
  date: ''
})

const handleSubmit = () => {
  const newExpense = {
    tripId: props.tripId,
    description: form.description,
    amount: form.amount,
    currency: form.currency,
    category: form.category,
    date: form.date || undefined
  }
  
  emit('add', newExpense)
  emit('close')
}
</script>
