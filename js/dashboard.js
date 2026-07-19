/* ==========================================================================
   SENN — Sweet Seventeen | dashboard.js
   Admin dashboard: statistics, searchable guest table, attendance pie
   chart, Excel export, delete, and refresh (from Google Sheets if
   config.js has a GAS_URL, otherwise from local storage).
   ========================================================================== */

(function () {
  'use strict';

  let currentGuests = [];

  async function fetchGuests() {
    const url = window.SENN_CONFIG && window.SENN_CONFIG.GAS_URL;
    if (url) {
      try {
        const res = await fetch(url + '?action=list');
        const data = await res.json();
        if (Array.isArray(data)) return data;
      } catch (err) {
        console.warn('Could not reach Google Sheet, showing local data instead:', err);
      }
    }
    return window.SennData.getAll();
  }

  function renderStats(guests) {
    const total = guests.length;
    const coming = guests.filter((g) => g.attendance === 'coming').length;
    const notComing = guests.filter((g) => g.attendance === 'not_coming').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-coming').textContent = coming;
    document.getElementById('stat-not-coming').textContent = notComing;

    drawPieChart(coming, notComing);
  }

  function drawPieChart(coming, notComing) {
    const canvas = document.getElementById('pie-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const total = coming + notComing;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(176,141,95,0.12)';
      ctx.fill();
      ctx.fillStyle = '#6B5F5A';
      ctx.font = '14px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText('No RSVPs yet', cx, cy + 5);
      return;
    }

    const slices = [
      { value: coming, color: '#CFAF86' },
      { value: notComing, color: '#F3AFC6' }
    ];

    let start = -Math.PI / 2;
    slices.forEach((s) => {
      const angle = (s.value / total) * Math.PI * 2;
      if (s.value === 0) return;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
      start += angle;
    });

    /* Donut hole */
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF8F3';
    ctx.fill();

    ctx.fillStyle = '#3A3230';
    ctx.font = '600 20px "Cormorant Garamond"';
    ctx.textAlign = 'center';
    ctx.fillText(total, cx, cy + 7);
  }

  function renderTable(guests) {
    const tbody = document.getElementById('guest-table-body');
    const emptyState = document.getElementById('table-empty');
    tbody.innerHTML = '';

    if (!guests.length) {
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.classList.add('hidden');

    guests.forEach((g) => {
      const tr = document.createElement('tr');
      const badgeClass = g.attendance === 'coming' ? 'coming' : 'not-coming';
      const badgeText = g.attendance === 'coming' ? "OFCC ><" : "NUHH :(";

      tr.innerHTML = `
        <td>${escapeHtml(g.name)}</td>
        <td>${escapeHtml(g.phone)}</td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>${escapeHtml(g.message || '-')}</td>
        <td><button class="row-delete" data-id="${g.id}" title="Delete RSVP">✕</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.row-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!confirm('Delete this RSVP?')) return;
        window.SennData.remove(btn.getAttribute('data-id'));
        loadAndRender();
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function applySearch(guests, query) {
    if (!query) return guests;
    const q = query.toLowerCase();
    return guests.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q) ||
      (g.message || '').toLowerCase().includes(q)
    );
  }

  async function loadAndRender() {
    currentGuests = await fetchGuests();
    const searchInput = document.getElementById('guest-search');
    const filtered = applySearch(currentGuests, searchInput ? searchInput.value : '');
    renderStats(currentGuests);
    renderTable(filtered);
  }

  function exportToExcel() {
    if (typeof XLSX === 'undefined') {
      alert('Excel export library failed to load. Please check your internet connection.');
      return;
    }
    const rows = currentGuests.map((g) => ({
      Name: g.name,
      'Phone Number': g.phone,
      Attendance: g.attendance === 'coming' ? 'Coming' : "Can't Come",
      Message: g.message,
      'Submitted At': g.submittedAt
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RSVP Guests');
    XLSX.writeFile(wb, 'Senn_Sweet17_RSVP_List.xlsx');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('guest-table-body');
    if (!table) return;

    window.SennGuard.requireAdmin('admin-login.html');

    loadAndRender();

    const searchInput = document.getElementById('guest-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderTable(applySearch(currentGuests, searchInput.value));
      });
    }

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportToExcel);

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => {
      refreshBtn.classList.add('pulse-cta');
      loadAndRender().then(() => refreshBtn.classList.remove('pulse-cta'));
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
      window.SennGuard.logoutAdmin();
      window.SennNav.go('admin-login.html');
    });
  });
})();
