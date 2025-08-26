document.addEventListener('DOMContentLoaded', function() {
    // ===== TAB SWITCHING =====
    initTabs();

    // ===== BUDGET TRACKING VARIABLES =====
    let dailyCost = 0;
    let runningCost = 0;
    let projectBudget = 0;
    let materialCosts = [];
    let equipmentCosts = [];
    let otherCosts = [];
    let delays = [];
    let _idSeq = 1;

    // ===== INITIALIZATION =====
    initBudgetTracking();
    initProjectAutofill();

    initMobileMenu();
    initDatePickers();
    initSignaturePads();
    initPhotoUpload();
    initDynamicLists();
    setupTimeCalculation();
    initDelaysSection();
    initListDelegates();
    setupFormValidation();
    initWeatherControls();
    initDraftPersistence();

    function initTabs() {
        const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
        const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

        if (tabButtons.length === 0) return;

        function activateTab(targetId) {
            tabButtons.forEach(btn => {
                const isActive = btn.getAttribute('aria-controls') === targetId;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', String(isActive));
                btn.tabIndex = isActive ? 0 : -1;
            });

            tabPanels.forEach(panel => {
                const isActive = panel.id === targetId;
                panel.classList.toggle('active', isActive);
                panel.hidden = !isActive;
            });
        }
        // Wire up click handlers for tabs and activate the current one
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('aria-controls');
                if (target) activateTab(target);
            });
        });
        const activeBtn = tabButtons.find(b => b.classList.contains('active')) || tabButtons[0];
        if (activeBtn) {
            const target = activeBtn.getAttribute('aria-controls');
            if (target) activateTab(target);
        }
    }

    // ===== ENTRY LIST DELEGATES (Edit/Delete) =====
    function initListDelegates() {
        const listIds = ['materialsList', 'equipmentList', 'otherCostsList', 'delayList', 'taskList', 'subcontractorList'];
        listIds.forEach(id => {
            const list = document.getElementById(id);
            if (!list) return;
            list.addEventListener('click', function(e) {
                const btn = e.target.closest('.entry-action-btn');
                if (!btn) return;
                const item = btn.closest('.entry-item');
                if (!item) return;
                const contentElem = item.querySelector('.entry-content');
                if (btn.classList.contains('edit')) {
                    console.log('[Diary] Edit clicked on list:', id);
                    const newContent = prompt('Edit entry:', contentElem?.textContent || '');
                    if (newContent !== null && contentElem) {
                        contentElem.textContent = newContent;
                    }
                    return;
                }
                if (btn.classList.contains('delete')) {
                    console.log('[Diary] Delete clicked on list:', id);
                    if (!confirm('Remove this entry?')) return;
                    const type = item.dataset.entryType;
                    const idNum = parseInt(item.dataset.entryId || '0');
                    if (type === 'material') {
                        const idx = materialCosts.findIndex(x => x.id === idNum);
                        if (idx >= 0) {
                            dailyCost -= materialCosts[idx].cost;
                            materialCosts.splice(idx, 1);
                            updateBudgetSummary();
                            console.log('[Diary] Removed material id', idNum);
                        }
                    } else if (type === 'equipment') {
                        const idx = equipmentCosts.findIndex(x => x.id === idNum);
                        if (idx >= 0) {
                            dailyCost -= equipmentCosts[idx].cost;
                            equipmentCosts.splice(idx, 1);
                            updateBudgetSummary();
                            console.log('[Diary] Removed equipment id', idNum);
                        }
                    } else if (type === 'other') {
                        const idx = otherCosts.findIndex(x => x.id === idNum);
                        if (idx >= 0) {
                            dailyCost -= otherCosts[idx].amount;
                            otherCosts.splice(idx, 1);
                            updateBudgetSummary();
                            console.log('[Diary] Removed other cost id', idNum);
                        }
                    } else if (type === 'delay') {
                        const idx = delays.findIndex(d => d.id === idNum);
                        if (idx >= 0) {
                            delays.splice(idx, 1);
                            console.log('[Diary] Removed delay id', idNum);
                        }
                    }
                    item.remove();
                }
            });
        });
    }

    // ===== DELAYS & ISSUES SECTION =====
    function initDelaysSection() {
        const addBtn = document.getElementById('addDelay');
        if (!addBtn) return;
        addBtn.addEventListener('click', function() {
            const typeSel = document.getElementById('delayType');
            const impactSel = document.getElementById('delayImpact');
            const descEl = document.getElementById('delayDescription');
            const solEl = document.getElementById('delaySolution');
            const list = document.getElementById('delayList');

            const typeText = typeSel?.options[typeSel.selectedIndex]?.text || '';
            const typeVal = typeSel?.value || '';
            const impactText = impactSel?.options[impactSel.selectedIndex]?.text || '';
            const impactVal = impactSel?.value || '';
            const desc = (descEl?.value || '').trim();
            const sol = (solEl?.value || '').trim();

            if (!typeText && !desc) {
                alert('Please select a type or provide a description for the delay/issue.');
                return;
            }

            const header = [typeText, impactText].filter(Boolean).join(' - ');
            const lines = [];
            if (header) lines.push(`<strong>${header}</strong>`);
            if (desc) lines.push(escapeHtml(desc));
            if (sol) lines.push(`<em>Mitigation:</em> ${escapeHtml(sol)}`);
            const content = lines.join('<br>');

            const entry = { id: _idSeq++, type: typeVal, typeLabel: typeText, impact: impactVal, impactLabel: impactText, description: desc, solution: sol };
            delays.push(entry);
            addItemToList(content, list, null, { type: 'delay', id: entry.id });
            console.log('[Diary] Added delay:', entry);

            // Clear inputs
            if (typeSel) typeSel.value = '';
            if (impactSel) impactSel.value = '';
            if (descEl) descEl.value = '';
            if (solEl) solEl.value = '';
        });
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    // ===== BUDGET TRACKING FUNCTIONS =====
    function initBudgetTracking() {
        // Update project budget when project is selected
        document.getElementById('projectSelect').addEventListener('change', function() {
            const projectCode = this.options[this.selectedIndex].value;
            // In a real app, this would fetch from server
            projectBudget = parseInt(localStorage.getItem(`project_budget_${projectCode}`)) || 0;
            document.getElementById('projectBudget').value = formatCurrency(projectBudget);

            // For demo, set a running cost (25% of budget)
            runningCost = Math.floor(projectBudget * 0.25);
            updateBudgetSummary();
        });

        // Calculate costs when items are added
        document.getElementById('addMaterial')?.addEventListener('click', addMaterialCost);
        document.getElementById('addEquipment')?.addEventListener('click', addEquipmentCost);
        document.getElementById('addOtherCost')?.addEventListener('click', addOtherCost);
    }

    // ===== PROJECT AUTOFILL (Number & Location) =====
    function initProjectAutofill() {
        const projectMeta = {
            'river-view': { number: 'RV-2025-001', budget: 120000000, location: 'Pasig River, Manila' },
            'central-tower': { number: 'CBD-2025-014', budget: 320000000, location: 'Makati CBD' },
            'highway-bridge': { number: 'HBX-2025-007', budget: 210000000, location: 'NLEX Extension' },
            'waterfront': { number: 'WFD-2025-003', budget: 150000000, location: 'Roxas Blvd. Waterfront' }
        };

        const select = document.getElementById('projectSelect');
        const num = document.getElementById('projectNumber');
        const loc = document.getElementById('location');
        const budgetInput = document.getElementById('projectBudget');

        if (!select) return;
        select.addEventListener('change', function() {
            const code = this.value;
            const meta = projectMeta[code];
            if (meta) {
                num && (num.value = meta.number);
                loc && (loc.value = meta.location);
                projectBudget = meta.budget; // keep JS state aligned
                budgetInput && (budgetInput.value = formatCurrency(projectBudget));
                runningCost = Math.floor(projectBudget * 0.25);
                updateBudgetSummary();
            } else {
                num && (num.value = '');
                loc && (loc.value = '');
                projectBudget = 0;
                budgetInput && (budgetInput.value = '');
                runningCost = 0;
                updateBudgetSummary();
            }
        });
    }

    function addMaterialCost() {
        const name = document.getElementById('materialName').value.trim();
        const quantity = parseFloat(document.getElementById('materialQuantity').value) || 0;
        const unit = document.getElementById('materialUnit').value;
        const cost = parseFloat(document.getElementById('materialCost').value) || 0;

        if (name && quantity && unit && cost > 0) {
            const material = { id: _idSeq++, name, quantity, unit, cost };
            materialCosts.push(material);
            dailyCost += cost;
            console.log('[Diary] Added material:', material);

            addItemToList(
                `<strong>${name}</strong> - ${quantity} ${unit} - ${formatCurrency(cost)}`,
                document.getElementById('materialsList'),
                null,
                { type: 'material', id: material.id }
            );

            clearInputs(['materialName', 'materialQuantity', 'materialUnit', 'materialCost']);
            updateBudgetSummary();
        }
    }

    function addEquipmentCost() {
        const name = document.getElementById('equipmentName').value.trim();
        const quantity = parseFloat(document.getElementById('equipmentQuantity').value) || 1;
        const hours = parseFloat(document.getElementById('equipmentHours').value) || 0;
        const cost = parseFloat(document.getElementById('equipmentCost').value) || 0;

        if (name && cost > 0) {
            const equipment = { id: _idSeq++, name, quantity, hours, cost };
            equipmentCosts.push(equipment);
            dailyCost += cost;
            console.log('[Diary] Added equipment:', equipment);

            const hoursPart = hours ? (' - ' + hours + ' hrs') : '';
            addItemToList(
                `<strong>${name}</strong> - ${quantity} unit${quantity > 1 ? 's' : ''}${hoursPart} - ${formatCurrency(cost)}`,
                document.getElementById('equipmentList'),
                null,
                { type: 'equipment', id: equipment.id }
            );

            clearInputs(['equipmentName', 'equipmentQuantity', 'equipmentHours', 'equipmentCost']);
            updateBudgetSummary();
        }
    }

    function addOtherCost() {
        const name = document.getElementById('otherCostName').value.trim();
        const amount = parseFloat(document.getElementById('otherCostAmount').value) || 0;

        if (name && amount > 0) {
            const cost = { id: _idSeq++, name, amount };
            otherCosts.push(cost);
            dailyCost += amount;
            console.log('[Diary] Added other cost:', cost);

            addItemToList(
                `<strong>${name}</strong> - ${formatCurrency(amount)}`,
                document.getElementById('otherCostsList'),
                null,
                { type: 'other', id: cost.id }
            );

            clearInputs(['otherCostName', 'otherCostAmount']);
            updateBudgetSummary();
        }
    }

    function updateBudgetSummary() {
        document.getElementById('dailyCost').value = formatCurrency(dailyCost);

        const totalUsed = runningCost + dailyCost;
        document.getElementById('runningCost').value = formatCurrency(totalUsed);

        if (projectBudget > 0) {
            const remaining = projectBudget - totalUsed;
            document.getElementById('remainingBudget').value = formatCurrency(remaining);

            // Visual feedback for budget status
            const remainingElement = document.getElementById('remainingBudget');
            if (remaining < projectBudget * 0.1) {
                remainingElement.classList.add('budget-warning');
                remainingElement.classList.remove('budget-safe');
            } else {
                remainingElement.classList.add('budget-safe');
                remainingElement.classList.remove('budget-warning');
            }
        }
    }

    function formatCurrency(amount) {
        return amount.toLocaleString('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function clearInputs(ids) {
        ids.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = element.tagName === 'SELECT' ? '' : (id.includes('Quantity') ? '1' : '');
        });
    }

    // ===== EXISTING FUNCTIONALITY (UPDATED FOR BUDGET INTEGRATION) =====
    function initMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', function() {
                navLinks.classList.toggle('active');
            });
        }
    }

    function initDatePickers() {
        flatpickr("#entryDate", {
            dateFormat: "Y-m-d",
            defaultDate: "today"
        });

        flatpickr("#startTime", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true
        });

        flatpickr("#endTime", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true
        });
    }

    function initSignaturePads() {
        const supervisorUpload = document.getElementById('supervisorSignatureUpload');
        const supervisorPreview = document.getElementById('supervisorSignaturePreview');
        const clientUpload = document.getElementById('clientSignatureUpload');
        const clientPreview = document.getElementById('clientSignaturePreview');

        function setupSignatureUpload(uploadInput, previewContainer, clearBtnId) {
            previewContainer.addEventListener('click', function() {
                uploadInput.click();
            });

            uploadInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();

                    reader.onload = function(e) {
                        previewContainer.innerHTML = `<img src="${e.target.result}" alt="Signature">`;
                    };

                    reader.readAsDataURL(this.files[0]);
                }
            });

            document.getElementById(clearBtnId).addEventListener('click', function() {
                uploadInput.value = '';
                previewContainer.innerHTML = `
                    <div class="upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="upload-text">Click to upload signature image</div>
                `;
            });
        }

        if (supervisorUpload && supervisorPreview) {
            setupSignatureUpload(supervisorUpload, supervisorPreview, 'clearSupervisorSignature');
        }

        if (clientUpload && clientPreview) {
            setupSignatureUpload(clientUpload, clientPreview, 'clearClientSignature');
        }
    }

    function initPhotoUpload() {
        const photoDropZone = document.getElementById('photoDropZone');
        const photoUpload = document.getElementById('photoUpload');
        const photoGallery = document.getElementById('photoGallery');

        if (photoDropZone && photoUpload) {
            photoDropZone.addEventListener('click', function() {
                photoUpload.click();
            });

            photoDropZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                photoDropZone.style.borderColor = 'var(--primary-color)';
            });

            photoDropZone.addEventListener('dragleave', function() {
                photoDropZone.style.borderColor = 'var(--border-color)';
            });

            photoDropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                photoDropZone.style.borderColor = 'var(--border-color)';

                if (e.dataTransfer.files.length) {
                    handleFiles(e.dataTransfer.files);
                }
            });

            photoUpload.addEventListener('change', function() {
                if (this.files.length) {
                    handleFiles(this.files);
                }
            });

            function handleFiles(files) {
                Array.from(files).forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();

                        reader.onload = function(e) {
                            addPhotoToGallery(e.target.result, file.name);
                        };

                        reader.readAsDataURL(file);
                    }
                });
                photoUpload.value = '';
            }

            function addPhotoToGallery(src, filename) {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';

                photoItem.innerHTML = `
                    <img src="${src}" alt="Site Photo" class="photo-preview">
                    <div class="photo-overlay">
                        <div class="photo-description">${filename}</div>
                        <div class="photo-actions">
                            <button type="button" class="photo-action-btn edit-desc" title="Edit Description">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="photo-action-btn delete-photo" title="Remove Photo">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;

                photoGallery.appendChild(photoItem);

                const editBtn = photoItem.querySelector('.edit-desc');
                const deleteBtn = photoItem.querySelector('.delete-photo');

                editBtn.addEventListener('click', function() {
                    const descElem = this.closest('.photo-overlay').querySelector('.photo-description');
                    const newDesc = prompt('Enter photo description:', descElem.textContent);
                    if (newDesc !== null) descElem.textContent = newDesc;
                });

                deleteBtn.addEventListener('click', function() {
                    if (confirm('Remove this photo?')) photoItem.remove();
                });
            }
        }
    }

    function setupFormValidation() {
        const form = document.getElementById('siteEntryForm');

        if (form) {
            form.addEventListener('submit', function(event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();

                    const invalidElements = form.querySelectorAll(':invalid');
                    if (invalidElements.length > 0) {
                        const firstInvalid = invalidElements[0];
                        if (window.__focusTabForElement) {
                            window.__focusTabForElement(firstInvalid);
                        }
                        firstInvalid.focus();
                    }
                }

                form.classList.add('was-validated');

                // Check supervisor signature
                const supervisorUpload = document.getElementById('supervisorSignatureUpload');
                if (supervisorUpload && !supervisorUpload.files.length) {
                    event.preventDefault();
                    const sigFeedback = document.querySelector('.signature-container .invalid-feedback');
                    if (sigFeedback) sigFeedback.style.display = 'block';
                    if (window.__focusTabForElement) window.__focusTabForElement(supervisorUpload);
                } else {
                    const sigFeedback = document.querySelector('.signature-container .invalid-feedback');
                    if (sigFeedback) sigFeedback.style.display = 'none';
                }
            });
        }
    }

    function initDynamicLists() {
        setupDynamicList('addTask', 'taskInput', 'taskList');
        setupDynamicList('addSubcontractor', 'subcontractorInput', 'subcontractorList');

        function setupDynamicList(addBtnId, inputId, listId, formatFunction) {
            const addBtn = document.getElementById(addBtnId);
            const input = document.getElementById(inputId);
            const list = document.getElementById(listId);

            if (addBtn && input && list) {
                addBtn.addEventListener('click', function() {
                    const value = input.value.trim();
                    if (value) {
                        addItemToList(value, list, formatFunction);
                        input.value = '';
                        input.focus();
                    }
                });

                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addBtn.click();
                    }
                });

                setupExistingItemActions(list);
            }
        }

        function setupExistingItemActions(list) {
            const items = list.querySelectorAll('.entry-item');
            items.forEach(item => setupItemActions(item));
        }
    }

    // Make list helpers global within this module scope so any section can use them
    function addItemToList(value, list, formatFunction, meta) {
        const item = document.createElement('div');
        item.className = 'entry-item';
        if (meta) {
            item.dataset.entryType = meta.type;
            item.dataset.entryId = String(meta.id);
        }

        const content = formatFunction ? formatFunction(value) : value;

        item.innerHTML = `
            <div class="entry-content">${content}</div>
            <div class="entry-actions">
                <button type="button" class="entry-action-btn edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="entry-action-btn delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        list.appendChild(item);
        setupItemActions(item);
    }

    function setupItemActions(item) {
        const editBtn = item.querySelector('.edit');
        const deleteBtn = item.querySelector('.delete');
        const contentElem = item.querySelector('.entry-content');

        editBtn.addEventListener('click', function() {
            const newContent = prompt('Edit entry:', contentElem.textContent);
            if (newContent !== null) contentElem.textContent = newContent;
        });

        deleteBtn.addEventListener('click', function() {
            if (!confirm('Remove this entry?')) return;
            // If this item is a cost-backed entry, sync arrays and totals
            const type = item.dataset.entryType;
            const id = parseInt(item.dataset.entryId || '0');
            if (type === 'material') {
                const idx = materialCosts.findIndex(x => x.id === id);
                if (idx >= 0) {
                    dailyCost -= materialCosts[idx].cost;
                    materialCosts.splice(idx, 1);
                    updateBudgetSummary();
                }
            } else if (type === 'equipment') {
                const idx = equipmentCosts.findIndex(x => x.id === id);
                if (idx >= 0) {
                    dailyCost -= equipmentCosts[idx].cost;
                    equipmentCosts.splice(idx, 1);
                    updateBudgetSummary();
                }
            } else if (type === 'other') {
                const idx = otherCosts.findIndex(x => x.id === id);
                if (idx >= 0) {
                    dailyCost -= otherCosts[idx].amount;
                    otherCosts.splice(idx, 1);
                    updateBudgetSummary();
                }
            }
            item.remove();
        });
    }

    function setupTimeCalculation() {
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        const totalHoursInput = document.getElementById('totalHours');

        function calculateHours() {
            if (startTimeInput.value && endTimeInput.value) {
                const startParts = startTimeInput.value.split(':');
                const endParts = endTimeInput.value.split(':');

                if (startParts.length === 2 && endParts.length === 2) {
                    const startHour = parseInt(startParts[0]);
                    const startMinute = parseInt(startParts[1]);
                    const endHour = parseInt(endParts[0]);
                    const endMinute = parseInt(endParts[1]);

                    let totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
                    if (totalMinutes < 0) totalMinutes += 24 * 60;

                    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
                    totalHoursInput.value = totalHours;
                }
            }
        }

        if (startTimeInput && endTimeInput) {
            startTimeInput._flatpickr.config.onChange.push(calculateHours);
            endTimeInput._flatpickr.config.onChange.push(calculateHours);
        }
    }

    // ===== WEATHER CONTROLS (Detect & Refresh) =====
    function initWeatherControls() {
        const detectBtn = document.getElementById('detectLocation');
        const refreshBtn = document.getElementById('refreshWeather');
        const siteLoc = document.getElementById('siteLocation');

        if (detectBtn) {
            detectBtn.addEventListener('click', async function() {
                if (!navigator.geolocation) {
                    alert('Geolocation is not supported by your browser.');
                    return;
                }
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    // Try reverse geocoding via Nominatim (no key). Backend should replace.
                    try {
                        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                        const data = await resp.json();
                        const label = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
                        if (siteLoc) siteLoc.value = label;
                    } catch (_) {
                        if (siteLoc) siteLoc.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
                    }
                    // Notify weather module
                    window.dispatchEvent(new CustomEvent('weather:detect', { detail: { latitude, longitude, value: siteLoc?.value || '' } }));
                }, (err) => {
                    alert('Unable to detect location: ' + err.message);
                });
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                window.dispatchEvent(new CustomEvent('weather:refresh', { detail: { value: siteLoc?.value || '' } }));
            });
        }
    }

    // ===== DRAFT PERSISTENCE & SUBMIT PAYLOAD =====
    function initDraftPersistence() {
        const DRAFT_KEY = 'siteDiaryDraft_v1';
        const form = document.getElementById('siteEntryForm');
        const saveBtn = document.getElementById('saveAsDraft');
        const submitBtn = document.getElementById('submitDiary');

        // Restore if exists
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                restoreFromData(data);
            }
        } catch (_) {}

        // Debounced auto-save on input changes
        let saveTimer;
        function queueAutosave() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(saveDraft, 600);
        }
        form?.addEventListener('input', queueAutosave, true);

        saveBtn?.addEventListener('click', function() {
            saveDraft(true);
        });

        form?.addEventListener('submit', function(e) {
            // allow HTML5 validation to run first
            if (!form.checkValidity()) return;
            e.preventDefault();
            const payload = buildPayload();
            // For now, preview in console and alert; backend can POST payload
            console.log('Submitting Site Diary Payload:', payload);
            alert('Entry ready for submission. Check console for JSON payload.');
            // Clear draft upon successful submit action
            localStorage.removeItem(DRAFT_KEY);
        });

        function saveDraft(showToast = false) {
            try {
                const data = buildPayload();
                localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
                const saveStatus = document.querySelector('.save-status span');
                if (saveStatus) {
                    const now = new Date();
                    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    saveStatus.textContent = `Last saved: Today at ${timeString}`;
                }
                if (showToast) {
                    alert('Draft saved successfully. You can come back and complete this entry later.');
                }
            } catch (err) {
                console.error('Failed to save draft:', err);
            }
        }

        function restoreFromData(data) {
            // Basic fields
            setVal('projectSelect', data.project?.code || '');
            setVal('projectNumber', data.project?.number || '');
            setVal('projectBudget', data.project?.budgetDisplay || '');
            setVal('location', data.project?.location || '');
            setVal('entryDate', data.project?.date || '');

            setVal('milestonePhase', data.milestone?.phase || '');
            setVal('customMilestone', data.milestone?.custom || '');

            setVal('siteLocation', data.weather?.siteLocation || '');

            setVal('workPerformed', data.labor?.workPerformed || '');
            setVal('startTime', data.labor?.startTime || '');
            setVal('endTime', data.labor?.endTime || '');
            setVal('totalHours', data.labor?.totalHours || '');

            // Rebuild lists
            rebuildList('taskList', data.labor?.tasks || []);
            rebuildList('subcontractorList', data.labor?.subcontractors || []);
            // Restore costs arrays with fresh ids and recalc totals
            materialCosts = (data.materials?.items || []).map(m => ({ id: _idSeq++, name: m.name, quantity: m.quantity, unit: m.unit, cost: Number(m.cost) || 0 }));
            equipmentCosts = (data.equipment?.items || []).map(e => ({ id: _idSeq++, name: e.name, quantity: e.quantity, hours: e.hours, cost: Number(e.cost) || 0 }));
            otherCosts = (data.otherCosts?.items || []).map(o => ({ id: _idSeq++, name: o.name, amount: Number(o.amount) || 0 }));
            // Recompute dailyCost from arrays
            dailyCost = 0;
            materialCosts.forEach(x => dailyCost += x.cost);
            equipmentCosts.forEach(x => dailyCost += x.cost);
            otherCosts.forEach(x => dailyCost += x.amount);
            updateBudgetSummary();

            // Rebuild cost lists with meta so deletes sync totals
            const materialsList = document.getElementById('materialsList');
            const equipmentList = document.getElementById('equipmentList');
            const otherList = document.getElementById('otherCostsList');
            const delayList = document.getElementById('delayList');
            if (materialsList) {
                materialsList.innerHTML = '';
                materialCosts.forEach(m => addItemToList(`<strong>${m.name}</strong> - ${m.quantity} ${m.unit} - ${formatCurrency(m.cost)}`, materialsList, null, { type: 'material', id: m.id }));
            }
            if (equipmentList) {
                equipmentList.innerHTML = '';
                equipmentCosts.forEach(e => addItemToList(`<strong>${e.name}</strong> - ${e.quantity} unit${e.quantity > 1 ? 's' : ''}${e.hours ? ` - ${e.hours} hrs` : ''} - ${formatCurrency(e.cost)}`, equipmentList, null, { type: 'equipment', id: e.id }));
            }
            if (otherList) {
                otherList.innerHTML = '';
                otherCosts.forEach(o => addItemToList(`<strong>${o.name}</strong> - ${formatCurrency(o.amount)}`, otherList, null, { type: 'other', id: o.id }));
            }
            // Restore delays
            delays = (data.delays?.items || []).map(d => ({ id: _idSeq++, type: d.type || '', typeLabel: '', impact: d.impact || '', impactLabel: '', description: d.description || '', solution: d.solution || '' }));
            if (delayList) {
                delayList.innerHTML = '';
                delays.forEach(d => {
                    const headerParts = [];
                    if (d.type) headerParts.push(d.type);
                    if (d.impact) headerParts.push(d.impact);
                    const header = headerParts.join(' - ');
                    const lines = [];
                    if (header) lines.push(`<strong>${escapeHtml(header)}</strong>`);
                    if (d.description) lines.push(escapeHtml(d.description));
                    if (d.solution) lines.push(`<em>Mitigation:</em> ${escapeHtml(d.solution)}`);
                    addItemToList(lines.join('<br>'), delayList, null, { type: 'delay', id: d.id });
                });
            }
        }

        function setVal(id, val) {
            const el = document.getElementById(id);
            if (!el) return;
            el.value = val;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }

        function rebuildList(listId, items) {
            const list = document.getElementById(listId);
            if (!list) return;
            list.innerHTML = '';
            items.forEach(text => addItemToList(text, list));
        }
    }

    // Build a structured payload ready for backend integration
    function buildPayload() {
        const get = (id) => document.getElementById(id);
        const projectCode = get('projectSelect')?.value || '';
        const budgetRaw = get('projectBudget')?.value || '';
        const budgetNum = parseCurrencyToNumber(budgetRaw);
        return {
            project: {
                code: projectCode,
                number: get('projectNumber')?.value || '',
                budget: budgetNum,
                budgetDisplay: budgetRaw,
                location: get('location')?.value || '',
                date: get('entryDate')?.value || ''
            },
            milestone: {
                phase: get('milestonePhase')?.value || '',
                custom: get('customMilestone')?.value || ''
            },
            weather: {
                siteLocation: get('siteLocation')?.value || '',
                morning: get('weatherMorning')?.value || '',
                afternoon: get('weatherAfternoon')?.value || ''
            },
            labor: {
                counts: {
                    supervisors: toInt(get('supervisorCount')?.value),
                    skilled: toInt(get('skilledCount')?.value),
                    unskilled: toInt(get('unskilledCount')?.value),
                    subcontractors: toInt(get('subcontractorCount')?.value)
                },
                workPerformed: get('workPerformed')?.value || '',
                startTime: get('startTime')?.value || '',
                endTime: get('endTime')?.value || '',
                totalHours: parseFloat(get('totalHours')?.value || '0') || 0,
                tasks: readListTexts('taskList'),
                subcontractors: readListTexts('subcontractorList')
            },
            materials: {
                items: materialCosts.map(m => ({
                    name: m.name,
                    quantity: m.quantity,
                    unit: m.unit,
                    cost: m.cost,
                    costDisplay: formatCurrency(m.cost)
                }))
            },
            equipment: {
                items: equipmentCosts.map(e => ({
                    name: e.name,
                    quantity: e.quantity,
                    hours: e.hours,
                    cost: e.cost,
                    costDisplay: formatCurrency(e.cost)
                }))
            },
            otherCosts: {
                items: otherCosts.map(o => ({
                    name: o.name,
                    amount: o.amount,
                    amountDisplay: formatCurrency(o.amount)
                }))
            },
            delays: {
                items: delays.map(d => ({
                    type: d.type,
                    impact: d.impact,
                    description: d.description,
                    solution: d.solution
                }))
            },
            budgetSummary: {
                dailyCost,
                runningCost: runningCost + dailyCost,
                projectBudget,
                remaining: projectBudget - (runningCost + dailyCost)
            }
        };
    }

    function readListTexts(listId) {
        const list = document.getElementById(listId);
        if (!list) return [];
        return Array.from(list.querySelectorAll('.entry-item .entry-content'))
            .map(el => el.textContent.trim())
            .filter(Boolean);
    }

    function parseCurrencyToNumber(text) {
        if (!text) return 0;
        // Remove non-numeric except dot and comma, then normalize
        const normalized = text.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
        const n = parseFloat(normalized);
        return isNaN(n) ? 0 : n;
    }
});