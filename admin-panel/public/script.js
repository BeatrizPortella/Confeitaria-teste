document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    const supabaseUrl = 'https://lzkkcjpxkfkjlwmnbrfr.supabase.co';
    const supabaseKey = 'sb_publishable_YDWxXWl4mpceE1G60koxkQ_Jp9x796m';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const totalSteps = 6;
    let currentStep = 1;

    const formData = {
        size: '',
        price: '',
        dough: '',
        filling1: '',
        filling2: '',
        coverage: '',
        decoration: '',
        decorationExtras: [],
        name: '',
        observations: ''
    };

    // DOM Elements
    const steps = document.querySelectorAll('.wizard-step');
    const dots = document.querySelectorAll('.step-dot');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    // Load Options from Supabase
    await loadOptions();

    // Initialize UI
    updateUI();

    // --- Data Loading ---
    async function loadOptions() {
        try {
            const { data: options, error } = await supabase
                .from('options')
                .select('*')
                .eq('active', true)
                .order('order', { ascending: true });

            if (error) throw error;

            renderOptions(options);
        } catch (error) {
            console.error('Erro ao carregar opções:', error);
            alert('Erro ao carregar opções do cardápio. Por favor, recarregue a página.');
        }
    }

    function renderOptions(options) {
        // Render Sizes
        const sizes = options.filter(o => o.type === 'TAMANHO');
        const sizeContainer = document.getElementById('size-options-container');
        if (sizes.length > 0) {
            let html = '<table class="size-table">';
            sizes.forEach(opt => {
                const priceFormatted = opt.price > 0 ? `R$ ${parseFloat(opt.price).toFixed(2).replace('.', ',')}` : 'Sob consulta';
                html += `
                    <tr class="size-option" data-value="${opt.name}" data-price="${opt.price}">
                        <td>
                            <strong>${opt.name}</strong>
                            ${opt.price > 0 ? `<span style="float: right; font-weight: 600;">${priceFormatted}</span>` : ''}
                        </td>
                    </tr>`;
            });
            html += '</table>';
            sizeContainer.innerHTML = html;
            attachSizeListeners();
        } else {
            sizeContainer.innerHTML = '<p>Nenhum tamanho disponível.</p>';
        }

        // Render Doughs
        renderGridOptions(options.filter(o => o.type === 'MASSA'), 'MASSA', 'dough-options-container', 'dough');

        // Render Fillings (for both steps)
        renderGridOptions(options.filter(o => o.type === 'RECHEIO'), 'RECHEIO', 'filling1-options', 'filling1');
        renderGridOptions(options.filter(o => o.type === 'RECHEIO'), 'RECHEIO', 'filling2-options', 'filling2');

        // Render Coverages
        renderGridOptions(options.filter(o => o.type === 'COBERTURA'), 'COBERTURA', 'coverage-options-container', 'coverage');

        // Render Decorations (Type: ADICIONAL, Meta: category='DECORACAO')
        const decorations = options.filter(o => o.type === 'ADICIONAL' && o.meta?.category === 'DECORACAO');
        renderGridOptions(decorations, 'ADICIONAL', 'decoration-options-container', 'decoration');

        // Render Extras (Type: ADICIONAL, Meta: category='EXTRA')
        const extras = options.filter(o => o.type === 'ADICIONAL' && o.meta?.category === 'EXTRA');
        const extrasContainer = document.getElementById('extras-options-container');
        if (extras.length > 0) {
            let html = '';
            extras.forEach(opt => {
                const priceFormatted = opt.price > 0 ? `R$ ${parseFloat(opt.price).toFixed(2).replace('.', ',')}` : '';
                html += `
                    <label style="display: flex; align-items: center; gap: 10px; font-size: 1.1rem; cursor: pointer;">
                        <input type="checkbox" name="extra_decoration" value="${opt.name} (${priceFormatted})" style="width: 20px; height: 20px; accent-color: var(--color-primary);">
                        ${opt.name}: <span style="color: var(--color-primary); font-weight: bold;">${priceFormatted}</span>
                    </label>`;
            });
            extrasContainer.innerHTML = html;
            attachExtraListeners();
        } else {
            extrasContainer.innerHTML = '<p>Nenhum adicional disponível.</p>';
        }
    }

    function renderGridOptions(filteredOptions, type, containerId, dataType) {
        // Note: filteredOptions is passed directly now, so we don't filter by type inside
        const container = document.getElementById(containerId);
        if (!container) return;

        if (filteredOptions.length > 0) {
            let html = '';
            filteredOptions.forEach(opt => {
                html += `
                    <div class="option-card" data-type="${dataType}" data-value="${opt.name}">
                        <h4>${opt.name}</h4>
                        ${opt.price > 0 ? `<p style="font-size: 0.8rem; color: #888; margin-top: 5px;">+ R$ ${parseFloat(opt.price).toFixed(2).replace('.', ',')}</p>` : ''}
                    </div>`;
            });
            container.innerHTML = html;
            attachCardListeners(container);
        } else {
            container.innerHTML = '<p>Nenhuma opção disponível.</p>';
        }
    }

    // --- Event Listeners Attachment ---

    function attachSizeListeners() {
        document.querySelectorAll('.size-option').forEach(row => {
            row.addEventListener('click', function () {
                document.querySelectorAll('.size-option').forEach(r => r.classList.remove('selected'));
                this.classList.add('selected');
                formData.size = this.dataset.value;
                formData.price = this.dataset.price || 'Sob consulta';
            });
        });
    }

    function attachCardListeners(container) {
        container.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', function () {
                const type = this.dataset.type;
                const value = this.dataset.value;

                // Handle selection styling
                const siblings = this.parentElement.querySelectorAll('.option-card');
                siblings.forEach(sib => sib.classList.remove('selected'));
                this.classList.add('selected');

                // Save data
                if (type === 'dough') formData.dough = value;
                if (type === 'filling1') formData.filling1 = value;
                if (type === 'filling2') formData.filling2 = value;
                if (type === 'coverage') formData.coverage = value;
                if (type === 'decoration') formData.decoration = value;
            });
        });
    }

    function attachExtraListeners() {
        document.querySelectorAll('input[name="extra_decoration"]').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    formData.decorationExtras.push(this.value);
                } else {
                    formData.decorationExtras = formData.decorationExtras.filter(item => item !== this.value);
                }
            });
        });
    }

    // --- Navigation & Submission ---

    nextBtn.addEventListener('click', async () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateUI();
            } else {
                await handleFinish();
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    async function handleFinish() {
        nextBtn.disabled = true;
        nextBtn.textContent = 'Enviando...';

        try {
            // 1. Save to Supabase
            const orderData = {
                customer_name: formData.name,
                customer_phone: 'Não informado', // We might want to add this field to the form
                items: formData,
                total: parseFloat(formData.price) || 0, // Simplified total calculation
                status: 'NEW'
            };

            const { error } = await supabase.from('orders').insert([orderData]);

            if (error) {
                console.error('Erro ao salvar pedido:', error);
                // We continue to WhatsApp even if saving fails, or we could alert the user
            }

            // 2. Send to WhatsApp
            sendToWhatsApp();

        } catch (err) {
            console.error(err);
            sendToWhatsApp(); // Fallback
        } finally {
            nextBtn.disabled = false;
            nextBtn.textContent = 'Enviar Pedido via WhatsApp';
        }
    }

    // --- Helper Functions ---

    function updateUI() {
        // Show/Hide Steps
        steps.forEach(step => step.classList.remove('active'));
        const currentStepEl = document.getElementById(`step${currentStep}`);
        if (currentStepEl) currentStepEl.classList.add('active');

        // Update Dots
        dots.forEach(dot => {
            dot.classList.remove('active');
            if (parseInt(dot.dataset.step) <= currentStep) {
                dot.classList.add('active');
            }
        });

        // Button States
        if (currentStep === 1) {
            prevBtn.style.visibility = 'hidden';
        } else {
            prevBtn.style.visibility = 'visible';
        }

        if (currentStep === totalSteps) {
            nextBtn.textContent = 'Enviar Pedido via WhatsApp';
            nextBtn.classList.add('btn-whatsapp');
            updateSummary();
        } else {
            nextBtn.textContent = 'Próximo';
            nextBtn.classList.remove('btn-whatsapp');
        }

        // Scroll to top
        const container = document.querySelector('.wizard-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function validateStep(step) {
        if (step === 1 && !formData.size) return alertAndReturn('Por favor, escolha um tamanho.');
        if (step === 2 && !formData.dough) return alertAndReturn('Por favor, escolha a massa.');
        if (step === 3 && (!formData.filling1 || !formData.filling2)) return alertAndReturn('Por favor, escolha os dois recheios.');
        if (step === 4 && !formData.coverage) return alertAndReturn('Por favor, escolha a cobertura.');
        // Step 5 validation removed as decoration might be optional or handled via extras now
        // if (step === 5 && !formData.decoration) return alertAndReturn('Por favor, escolha uma opção de decoração.');

        if (step === 6) {
            const name = document.getElementById('customerName').value;
            if (!name) return alertAndReturn('Por favor, digite seu nome.');
            formData.name = name;
            formData.observations = document.getElementById('observations').value;
        }
        return true;
    }

    function alertAndReturn(msg) {
        alert(msg);
        return false;
    }

    function updateSummary() {
        document.getElementById('summarySize').textContent = formData.size || '-';
        document.getElementById('summaryDough').textContent = formData.dough || '-';
        document.getElementById('summaryFilling1').textContent = formData.filling1 || '-';
        document.getElementById('summaryFilling2').textContent = formData.filling2 || '-';
        document.getElementById('summaryCoverage').textContent = formData.coverage || '-';
        document.getElementById('summaryDecoration').textContent = formData.decoration || '-';

        const extrasContainer = document.getElementById('summaryExtrasContainer');
        const extrasSpan = document.getElementById('summaryExtras');
        if (formData.decorationExtras.length > 0) {
            extrasContainer.style.display = 'block';
            extrasSpan.textContent = formData.decorationExtras.join(', ');
        } else {
            extrasContainer.style.display = 'none';
        }
    }

    function sendToWhatsApp() {
        const phoneNumber = "5511991311621";

        let message = `*Novo Pedido - Confeitaria Renata Magela* 🎂\n\n`;
        message += `*Cliente:* ${formData.name}\n`;
        message += `----------------------------------\n`;
        message += `*Tamanho:* ${formData.size}\n`;
        message += `*Massa:* ${formData.dough}\n`;
        message += `*Recheio 1:* ${formData.filling1}\n`;
        message += `*Recheio 2:* ${formData.filling2}\n`;
        message += `*Cobertura:* ${formData.coverage}\n`;
        if (formData.decoration) message += `*Decoração:* ${formData.decoration}\n`;
        if (formData.decorationExtras.length > 0) {
            message += `*Extras:* ${formData.decorationExtras.join(', ')}\n`;
        }
        message += `----------------------------------\n`;
        if (formData.observations) {
            message += `*Observações:* ${formData.observations}\n`;
        }
        message += `\nAguardo confirmação!`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    }
});
