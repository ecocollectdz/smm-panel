const fetch = require('node-fetch');
const logger = require('../utils/logger');

class SMMProviderService {
  constructor() {
    this.apiUrl = process.env.SMM_API_URL;
    this.apiKey = process.env.SMM_API_KEY;
  }

  async makeRequest(params) {
    try {
      const body = new URLSearchParams({
        key: this.apiKey,
        ...params
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        timeout: 15000
      });

      if (!response.ok) {
        throw new Error(`Provider API HTTP error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('SMM Provider API error:', error);
      throw error;
    }
  }

  // Get all services from provider
  async getServices() {
    return this.makeRequest({ action: 'services' });
  }

  // Place an order
  async createOrder({ serviceId, link, quantity, runs, interval }) {
    const params = {
      action: 'add',
      service: serviceId,
      link,
      quantity
    };
    if (runs) params.runs = runs;
    if (interval) params.interval = interval;

    return this.makeRequest(params);
  }

  // Get order status
  async getOrderStatus(orderId) {
    return this.makeRequest({ action: 'status', order: orderId });
  }

  // Get multiple orders status
  async getMultipleOrderStatus(orderIds) {
    return this.makeRequest({ action: 'status', orders: orderIds.join(',') });
  }

  // Get balance from provider
  async getBalance() {
    return this.makeRequest({ action: 'balance' });
  }

  // Cancel order (if provider supports it)
  async cancelOrder(orderId) {
    return this.makeRequest({ action: 'cancel', orders: orderId });
  }

  // Refill order (if provider supports it)
  async refillOrder(orderId) {
    return this.makeRequest({ action: 'refill', order: orderId });
  }
}

module.exports = new SMMProviderService();
