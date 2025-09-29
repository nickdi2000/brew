import { getTransactions, addTransaction, getBalance } from '@/api/transactions';

export default {
  namespaced: true,

  state: {
    transactions: [],
    loading: false,
    error: null,
    currentBalance: 0
  },

  mutations: {
    SET_TRANSACTIONS(state, transactions) {
      state.transactions = transactions;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_TRANSACTION(state, transaction) {
      state.transactions.unshift(transaction);
    },
    SET_BALANCE(state, balance) {
      state.currentBalance = balance;
    }
  },

  actions: {
    async fetchTransactions({ commit }, memberId) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await getTransactions(memberId);
        commit('SET_TRANSACTIONS', response.data.data.transactions);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createTransaction({ commit }, { memberId, transactionData }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        const response = await addTransaction(memberId, transactionData);
        commit('ADD_TRANSACTION', response.data.data.transaction);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchBalance({ commit }, memberId) {
      try {
        const response = await getBalance(memberId);
        commit('SET_BALANCE', response.data.balance);
        return response.data.balance;
      } catch (error) {
        throw error;
      }
    }
  },

  getters: {
    allTransactions: state => state.transactions,
    isLoading: state => state.loading,
    error: state => state.error,
    currentBalance: state => state.currentBalance
  }
};