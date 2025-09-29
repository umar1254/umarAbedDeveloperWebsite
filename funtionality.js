// --- Navigation Toggle Script ---
        const menuButton = document.getElementById('hamburger-button');
        const mobileMenu = document.getElementById('mobile-nav');
        const mobileLinks = mobileMenu.querySelectorAll('a');

        const toggleMenu = () => {
            const isExpanded = menuButton.getAttribute('aria-expanded') === 'true' || false;
            mobileMenu.classList.toggle('active');
            menuButton.setAttribute('aria-expanded', !isExpanded);
        };

        menuButton.addEventListener('click', toggleMenu);

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });


        // --- Dark Mode Toggle Script ---
        const toggle = document.getElementById('darkModeToggle');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedMode = localStorage.getItem('darkMode');

        if (savedMode === 'enabled' || (savedMode === null && prefersDark)) {
            document.body.classList.add('dark-mode');
            toggle.checked = true;
        }

        toggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
        });


        // --- Custom Modal Logic (Replicating prompt/alert workflow) ---

        const modalOverlay = document.getElementById('customModalOverlay');
        const modalBox = document.getElementById('customModal');
        const modalPromptText = document.getElementById('modalPromptText');
        const modalMessage = document.getElementById('modalMessage');
        const modalEmailInput = document.getElementById('modalEmailInput');
        const modalActionButton = document.getElementById('modalActionButton');

        let currentCertUrl = ''; 

        /**
         * Shows the modal in either 'input' (for email) or 'message' (for confirmation/error).
         */
        function showModal(mode, content) {
            modalOverlay.classList.add('open');
            modalBox.classList.remove('modal-input-mode', 'modal-message-mode');
            
            if (mode === 'input') {
                modalBox.classList.add('modal-input-mode');
                modalPromptText.textContent = content;
                modalEmailInput.value = ''; // Clear previous input
                modalEmailInput.style.display = 'block';
                modalMessage.style.display = 'none';
                modalActionButton.setAttribute('data-mode', 'input');
                modalActionButton.textContent = 'Submit';
                modalEmailInput.focus();
            } else if (mode === 'message') {
                modalBox.classList.add('modal-message-mode');
                modalMessage.textContent = content;
                modalEmailInput.style.display = 'none';
                modalMessage.style.display = 'block';
                modalActionButton.setAttribute('data-mode', 'close');
                modalActionButton.textContent = 'Close';
            }
        }

        /**
         * Hides the modal.
         */
        function hideModal() {
            modalOverlay.classList.remove('open');
        }

        /**
         * Handles the 'View Certificate' button click, initiating the email prompt workflow.
         */
        function viewCertificate(certificateUrl) {
            currentCertUrl = certificateUrl;
            showModal('input', "Please enter your email address to view the certificate:");
        }

        /**
         * Handles the main action button click inside the modal.
         */
        function handleModalAction() {
            const mode = modalActionButton.getAttribute('data-mode');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

            if (mode === 'input') {
                // --- Input Mode (Email Validation) ---
                const email = modalEmailInput.value.trim();

                if (!email) {
                    showModal('message', "Viewing the certificate requires an email address.");
                } else if (!emailRegex.test(email)) {
                    showModal('message', "Please enter a valid email address.");
                } else {
                    // Success: Submit email to Netlify form asynchronously

                    // 1. Prepare data for Netlify submission
                    const formData = new URLSearchParams();
                    //  The form-name must match the name of the hidden form in the HTML
                    formData.append("form-name", "certificate-emails"); 
                    formData.append("email", email);

                    fetch("/", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: formData.toString(),
                    })
                    .then(() => {
                        // Email capture successful 
                        console.log(`Certificate email captured: ${email}`);
                    })
                    .catch(error => {
                        // Log error but don't stop the user from viewing the certificate
                        console.error("Error submitting certificate email to Netlify:", error);
                    });

                    // 2. Show confirmation and open certificate 
                    showModal('message', `Thank you, ${email}! You will now be redirected to the certificate.`);
                    
                    // Open the certificate after confirmation message is set
                    window.open(currentCertUrl, '_blank'); 
                }

            } else if (mode === 'close') {
                // --- Message Mode (Close Modal) ---
                hideModal();
            }
        }

        modalActionButton.addEventListener('click', handleModalAction);

        // Allow closing with escape key (optional touch up)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
                hideModal();
            }
        });
