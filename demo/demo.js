const data = [
    { field: 'f1', input: 'ib1', text: 't1', row: 'ar1', val: 'av1', value: '15 Rue de Rivoli' },
    { field: 'f2', input: 'ib2', text: 't2', row: 'ar2', val: 'av2', value: '75001' },
    { field: 'f3', input: 'ib3', text: 't3', row: 'ar3', val: 'av3', value: '+33 6 12 34 56 78' },
    { field: 'f4', input: 'ib4', text: 't4', row: 'ar4', val: 'av4', value: 'marie.dupont@email.com' }
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function typeText(textEl, inputEl, text, agentVal, agentRow, speed = 50) {
    inputEl.classList.add('typing');
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    inputEl.appendChild(cursor);
    agentRow.classList.add('visible');

    for (let i = 0; i < text.length; i++) {
        textEl.textContent = text.slice(0, i + 1);
        if (i % 2 === 0) {
            agentVal.textContent = text.slice(0, i + 1);
            agentVal.classList.add('flash');
            setTimeout(() => agentVal.classList.remove('flash'), 200);
        }
        await sleep(speed);
    }
    agentVal.textContent = text;
    cursor.remove();
    inputEl.classList.remove('typing');
    await sleep(250);
}

async function runDemo() {
    data.forEach(d => {
        document.getElementById(d.field).classList.remove('visible');
        document.getElementById(d.input).classList.remove('typing');
        document.getElementById(d.text).textContent = '';
        document.getElementById(d.row).classList.remove('visible');
        document.getElementById(d.val).textContent = '—';
    });
    document.getElementById('flowConn').classList.remove('active');
    document.getElementById('statusPill').classList.remove('visible');

    await sleep(800);
    document.getElementById('flowConn').classList.add('active');
    document.getElementById('statusPill').classList.add('visible');
    await sleep(500);

    for (const d of data) {
        document.getElementById(d.field).classList.add('visible');
        await sleep(180);
        await typeText(
            document.getElementById(d.text),
            document.getElementById(d.input),
            d.value,
            document.getElementById(d.val),
            document.getElementById(d.row)
        );
        await sleep(350);
    }
    await sleep(3500);
    runDemo();
}
runDemo();
