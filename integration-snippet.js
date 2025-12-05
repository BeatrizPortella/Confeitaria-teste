/**
 * Integration Snippet for Confeitaria Public Form
 * 
 * This script demonstrates how to fetch options from the backend API
 * and dynamically populate the form fields.
 */

const API_URL = 'http://localhost:3000/api/options'; // Update with production URL

async function loadOptions() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch options');

        const options = await response.json();

        // Group options by type
        const fillings = options.filter(opt => opt.type === 'RECHEIO');
        const doughs = options.filter(opt => opt.type === 'MASSA');
        const toppings = options.filter(opt => opt.type === 'COBERTURA');
        const sizes = options.filter(opt => opt.type === 'TAMANHO');

        // Helper to populate select
        const populateSelect = (elementId, items) => {
            const select = document.getElementById(elementId);
            if (!select) return;

            // Clear existing options except the first one (placeholder)
            while (select.options.length > 1) {
                select.remove(1);
            }

            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id; // Or item.slug if preferred
                option.textContent = `${item.name}${item.price > 0 ? ` (+ R$ ${Number(item.price).toFixed(2)})` : ''}`;
                option.dataset.price = item.price;
                select.appendChild(option);
            });
        };

        // Populate your form fields
        populateSelect('recheio', fillings);
        populateSelect('massa', doughs);
        populateSelect('cobertura', toppings);
        populateSelect('tamanho', sizes);

    } catch (error) {
        console.error('Error loading options:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadOptions);
