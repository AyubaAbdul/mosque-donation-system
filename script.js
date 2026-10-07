const STORAGE_KEY = "mosque-donation-system";

const defaultState = {
  role: "donor",
  campaigns: [
    {
      id: 1,
      title: "Ramadan Relief Fund",
      category: "Food Security",
      goal: 35000,
      raised: 24500,
      description: "Support families with food packages and daily Ramadan meals during the holy month.",
      active: true,
    },
    {
      id: 2,
      title: "School Supplies Drive",
      category: "Education",
      goal: 18000,
      raised: 11850,
      description: "Provide essential school materials and educational support for children in need.",
      active: true,
    },
    {
      id: 3,
      title: "Mosque Renovation Project",
      category: "Mosque Support",
      goal: 50000,
      raised: 29300,
      description: "Fund a safe and welcoming worship space with improved facilities and accessibility.",
      active: true,
    },
    {
      id: 4,
      title: "Health Outreach Clinic",
      category: "Health & Wellbeing",
      goal: 22000,
      raised: 9800,
      description: "Bring health screening and wellness services to underserved community members.",
      active: true,
    },
  ],
  transactions: [
    {
      id: 1,
      donor: "Hassan Ali",
      amount: 120,
      campaign: "Ramadan Relief Fund",
      method: "Credit/Debit Card",
      status: "Successful",
      date: "2026-10-04",
    },
    {
      id: 2,
      donor: "Amina Yusuf",
      amount: 250,
      campaign: "School Supplies Drive",
      method: "Bank Transfer",
      status: "Successful",
      date: "2026-10-03",
    },
    {
      id: 3,
      donor: "Omar Rahman",
      amount: 75,
      campaign: "Health Outreach Clinic",
      method: "Mobile Money",
      status: "Pending",
      date: "2026-10-02",
    },
  ],
  receipts: [
    {
      id: 1,
      donor: "Hassan Ali",
      amount: 120,
      campaign: "Ramadan Relief Fund",
      date: "2026-10-04",
      reference: "MDS-20261004-001",
    },
    {
      id: 2,
      donor: "Amina Yusuf",
      amount: 250,
      campaign: "School Supplies Drive",
      date: "2026-10-03",
      reference: "MDS-20261003-004",
    },
  ],
  nextId: 5,
};

const elements = {
  causeGrid: document.getElementById("causeGrid"),
  reportGrid: document.getElementById("reportGrid"),
  receiptList: document.getElementById("receiptList"),
  donationForm: document.getElementById("donationForm"),
  donorName: document.getElementById("donorName"),
  donorEmail: document.getElementById("donorEmail"),
  campaignSelect: document.getElementById("campaignSelect"),
  donationAmount: document.getElementById("donationAmount"),
  paymentMethod: document.getElementById("paymentMethod"),
  donationFrequency: document.getElementById("donationFrequency"),
  donationNote: document.getElementById("donationNote"),
  quickDonateBtn: document.getElementById("quickDonateBtn"),
  transactionList: document.getElementById("transactionList"),
  campaignForm: document.getElementById("campaignForm"),
  roleButtons: document.querySelectorAll(".role-btn"),
  donorSections: document.querySelectorAll(".donor-section"),
  adminSection: document.getElementById("admin"),
  statRaised: document.getElementById("statRaised"),
  statCampaigns: document.getElementById("statCampaigns"),
  statDonors: document.getElementById("statDonors"),
  adminFunds: document.getElementById("adminFunds"),
  adminSuccess: document.getElementById("adminSuccess"),
  adminCampaignCount: document.getElementById("adminCampaignCount"),
  adminPending: document.getElementById("adminPending"),
  viewAllBtn: document.getElementById("viewAllBtn"),
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return structuredClone(defaultState);
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      campaigns: parsed.campaigns || structuredClone(defaultState.campaigns),
      transactions: parsed.transactions || structuredClone(defaultState.transactions),
      receipts: parsed.receipts || structuredClone(defaultState.receipts),
    };
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return structuredClone(defaultState);
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getActiveCampaigns() {
  return state.campaigns.filter((campaign) => campaign.active);
}

function renderCampaignSelector() {
  const activeCampaigns = getActiveCampaigns();
  elements.campaignSelect.innerHTML = activeCampaigns
    .map(
      (campaign) =>
        `<option value="${campaign.id}">${campaign.title} (${formatCurrency(campaign.raised)} raised)</option>`
    )
    .join("");

  if (!activeCampaigns.length) {
    elements.campaignSelect.innerHTML = '<option value="">No active campaigns</option>';
  }
}

function renderCampaigns() {
  const campaigns = getActiveCampaigns();

  if (!campaigns.length) {
    elements.causeGrid.innerHTML = '<div class="card cause-card"><h3>No active campaigns</h3><p>Admin can create a new cause from the dashboard.</p></div>';
    return;
  }

  elements.causeGrid.innerHTML = campaigns
    .map((campaign) => {
      const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
      return `
        <article class="card cause-card">
          <span class="campaign-badge">${campaign.category}</span>
          <h3>${campaign.title}</h3>
          <p>${campaign.description}</p>
          <div class="cause-meta">
            <span>${campaign.active ? "Active" : "Paused"}</span>
            <span>${Math.round(progress)}% funded</span>
          </div>
          <div class="cause-progress"><span style="width: ${progress}%"></span></div>
          <div class="cause-footer">
            <div class="amount">${formatCurrency(campaign.raised)} <small>of ${formatCurrency(campaign.goal)}</small></div>
            <button class="donate-btn" data-campaign-id="${campaign.id}">Donate</button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".donate-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const campaignId = Number(event.currentTarget.dataset.campaignId);
      const campaign = state.campaigns.find((item) => item.id === campaignId);
      if (!campaign) return;
      elements.campaignSelect.value = String(campaignId);
      elements.donationAmount.focus();
      document.getElementById("donate").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function renderReceipts() {
  const receipts = [...state.receipts].sort((a, b) => b.id - a.id).slice(0, 4);

  if (!receipts.length) {
    elements.receiptList.innerHTML = '<div class="receipt-item"><h4>No donations yet</h4><p>Your download receipts will appear here.</p></div>';
    return;
  }

  elements.receiptList.innerHTML = receipts
    .map(
      (receipt) => `
        <div class="receipt-item">
          <div class="receipt-top">
            <div>
              <h4>${receipt.campaign}</h4>
              <p>${receipt.donor} • ${receipt.date}</p>
            </div>
            <span class="receipt-tag">${formatCurrency(receipt.amount)}</span>
          </div>
          <div class="receipt-top" style="margin-top: 10px;">
            <p>Ref: ${receipt.reference}</p>
            <button class="download-btn" data-receipt-id="${receipt.id}">Download</button>
          </div>
        </div>
      `
    )
    .join("");

  document.querySelectorAll(".download-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const receiptId = Number(event.currentTarget.dataset.receiptId);
      const receipt = state.receipts.find((item) => item.id === receiptId);
      if (!receipt) return;

      const content = `Mosque Donation Receipt\n========================\nReference: ${receipt.reference}\nDonor: ${receipt.donor}\nCampaign: ${receipt.campaign}\nAmount: ${formatCurrency(receipt.amount)}\nDate: ${receipt.date}`;
      const blob = new Blob([content], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${receipt.reference}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  });
}

function renderReports() {
  const campaigns = getActiveCampaigns();
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goal, 0);

  elements.reportGrid.innerHTML = [
    {
      title: "Funds raised",
      value: formatCurrency(totalRaised),
      note: "Across all active campaigns",
    },
    {
      title: "Goal progress",
      value: `${Math.round((totalRaised / totalGoal) * 100)}%`,
      note: "Combined campaign target completion",
    },
    {
      title: "Top category",
      value: "Food Security",
      note: "Highest contribution volume this cycle",
    },
  ]
    .map(
      (item) => `
        <article class="card report-card">
          <h3>${item.title}</h3>
          <p>${item.note}</p>
          <div class="report-highlight">${item.value}</div>
        </article>
      `
    )
    .join("");
}

function renderAdmin() {
  const successfulTransactions = state.transactions.filter((txn) => txn.status === "Successful").length;
  const totalFunds = state.transactions
    .filter((txn) => txn.status === "Successful")
    .reduce((sum, txn) => sum + txn.amount, 0);

  elements.adminFunds.textContent = formatCurrency(totalFunds);
  elements.adminSuccess.textContent = String(successfulTransactions);
  elements.adminCampaignCount.textContent = String(getActiveCampaigns().length);
  elements.adminPending.textContent = String(
    state.transactions.filter((txn) => txn.status === "Pending").length
  );

  elements.transactionList.innerHTML = state.transactions
    .slice(0, 6)
    .map(
      (txn) => `
        <div class="transaction-item">
          <div class="transaction-row">
            <div>
              <h4>${txn.donor}</h4>
              <p>${txn.campaign} • ${txn.method}</p>
            </div>
            <span class="status-tag ${txn.status === "Successful" ? "success" : txn.status === "Pending" ? "pending" : "review"}">${txn.status}</span>
          </div>
          <div class="transaction-row" style="margin-top: 10px;">
            <p>${txn.date}</p>
            <strong>${formatCurrency(txn.amount)}</strong>
          </div>
        </div>
      `
    )
    .join("");
}

function renderStats() {
  const totalRaised = state.campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const donorsCount = new Set(state.transactions.map((txn) => txn.donor)).size;
  elements.statRaised.textContent = formatCurrency(totalRaised);
  elements.statCampaigns.textContent = String(getActiveCampaigns().length);
  elements.statDonors.textContent = String(donorsCount);
}

function updateRoleView() {
  const isAdmin = state.role === "admin";
  elements.roleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.role === state.role);
  });

  elements.donorSections.forEach((section) => {
    section.classList.toggle("hidden", isAdmin);
  });

  elements.adminSection.classList.toggle("hidden", !isAdmin);
}

function addCampaign(event) {
  event.preventDefault();

  const title = document.getElementById("newCampaignTitle").value.trim();
  const category = document.getElementById("newCampaignCategory").value;
  const goal = Number(document.getElementById("newCampaignGoal").value);
  const description = document.getElementById("newCampaignDescription").value.trim() || "Community impact campaign";

  if (!title || !goal || goal <= 0) {
    return;
  }

  const newCampaign = {
    id: state.nextId,
    title,
    category,
    goal,
    raised: 0,
    description,
    active: true,
  };

  state.campaigns.push(newCampaign);
  state.nextId += 1;
  saveState();
  elements.campaignForm.reset();
  renderAll();
}

function handleDonation(event) {
  event.preventDefault();

  const donorName = elements.donorName.value.trim();
  const donorEmail = elements.donorEmail.value.trim();
  const campaignId = Number(elements.campaignSelect.value);
  const amount = Number(elements.donationAmount.value);
  const paymentMethod = elements.paymentMethod.value;
  const frequency = elements.donationFrequency.value;
  const note = elements.donationNote.value.trim();

  if (!donorName || !donorEmail || !campaignId || !amount || amount <= 0) {
    return;
  }

  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) return;

  campaign.raised += amount;

  const transaction = {
    id: state.nextId,
    donor: donorName,
    amount,
    campaign: campaign.title,
    method: paymentMethod,
    status: "Successful",
    date: new Date().toISOString().slice(0, 10),
    email: donorEmail,
    frequency,
    note,
  };

  const receipt = {
    id: state.nextId,
    donor: donorName,
    amount,
    campaign: campaign.title,
    date: transaction.date,
    reference: `MDS-${transaction.date.replace(/-/g, "")}-${String(state.receipts.length + 1).padStart(3, "0")}`,
  };

  state.transactions.unshift(transaction);
  state.receipts.unshift(receipt);
  state.nextId += 1;

  saveState();
  elements.donationForm.reset();
  renderAll();
}

function renderAll() {
  renderCampaignSelector();
  renderCampaigns();
  renderReceipts();
  renderReports();
  renderAdmin();
  renderStats();
  updateRoleView();
}

function bindEvents() {
  elements.roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.role = button.dataset.role;
      saveState();
      updateRoleView();
    });
  });

  elements.donationForm.addEventListener("submit", handleDonation);
  elements.campaignForm.addEventListener("submit", addCampaign);
  elements.quickDonateBtn.addEventListener("click", () => {
    document.getElementById("donate").scrollIntoView({ behavior: "smooth" });
    elements.donationAmount.focus();
  });

  elements.viewAllBtn.addEventListener("click", () => {
    document.getElementById("causes").scrollIntoView({ behavior: "smooth" });
  });
}

function init() {
  bindEvents();
  renderAll();
}

init();
