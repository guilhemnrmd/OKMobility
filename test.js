        const form = document.getElementById('signupForm');
        const btnSubmit = document.getElementById('btnSubmit');
        const btnText = document.getElementById('btnText');
        const btnSpinner = document.getElementById('btnSpinner');
        const alertBanner = document.getElementById('alertBanner');

        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'invalid_token') {
            showAlert("Lien invalide. Veuillez recommencer l'inscription.", 'error');
        } else if (params.get('error') === 'expired_token') {
            showAlert('Votre lien de vérification a expiré (24h). Veuillez recommencer.', 'error');
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('inputName').value.trim();
            const email = document.getElementById('inputEmail').value.trim();
            const company = document.getElementById('inputCompany').value.trim();
            const terms = document.getElementById('inputTerms').checked;

            if (!name || !email || !company) {
                showAlert('Veuillez remplir tous les champs.', 'error');
                return;
            }
            if (!terms) {
                showAlert("Veuillez accepter les conditions d'utilisation.", 'error');
                return;
            }

            setLoading(true);
            hideAlert();

            try {
                const res = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, company }),
                });
                const data = await res.json();
                if (res.ok) {
                    if (data._devVerifyUrl) {
                        showAlert('Mode dev — lien de vérification : ' + data._devVerifyUrl, 'success');
                        setLoading(false);
                        return;
                    }
                    window.location.href = `/signup/check-email/?email=${encodeURIComponent(email)}`;
                } else {
                    showAlert(data.error || 'Une erreur est survenue.', 'error');
                }
            } catch (err) {
                console.error(err);
                showAlert('Erreur de connexion. Veuillez réessayer.', 'error');
            } finally {
                setLoading(false);
            }
        });

        function setLoading(on) {
            btnSubmit.disabled = on;
            btnText.textContent = on ? 'Envoi…' : "Créer mon compte d'essai";
            btnSpinner.style.display = on ? 'inline-block' : 'none';
        }
        function showAlert(msg, type) {
            alertBanner.textContent = msg;
            alertBanner.className = `alert alert-${type} show`;
        }
        function hideAlert() { alertBanner.className = 'alert'; }
