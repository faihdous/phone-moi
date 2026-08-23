document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const contactsList = document.getElementById("contactsList");
  const statusText = document.getElementById("status");

  const SUPABASE_URL = "https://hxdpfrnxawhyanjwvlmv.supabase.co";
  const SUPABASE_KEY =
    "sb_publishable_TLic-BebUrdemyOnDcKnnQ_MnlLJjgH";

  const TABLE_NAME = "employees";

  let contacts = [];

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showContacts(data) {
    if (!contactsList) return;

    contactsList.innerHTML = "";

    if (data.length === 0) {
      contactsList.innerHTML = `
        <p class="no-results">لا توجد نتائج</p>
      `;
      return;
    }

    data.forEach((employee) => {
      const card = document.createElement("div");
      card.className = "contact-card";

      card.innerHTML = `
        <h3>${escapeHTML(employee.name)}</h3>

        <p class="job-title">
          ${escapeHTML(employee.job_title)}
        </p>

        <div class="contact-details">
          <p>
            <strong>الرقم الداخلي:</strong>
            ${escapeHTML(employee.internal_number)}
          </p>

          <p>
            <strong>الرقم المباشر:</strong>
            ${escapeHTML(employee.direct_number)}
          </p>

          <p>
            <strong>رقم الجوال:</strong>
            ${escapeHTML(employee.mobile_number)}
          </p>
        </div>
      `;

      contactsList.appendChild(card);
    });
  }

  async function loadContacts() {
    try {
      if (statusText) {
        statusText.textContent = "جاري تحميل بيانات الموظفين...";
      }

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*`,
        {
          method: "GET",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      contacts = await response.json();
      showContacts(contacts);

      if (statusText) {
        statusText.textContent =
          `تم تحميل ${contacts.length} جهة اتصال`;
      }
    } catch (error) {
      console.error("Supabase error:", error);

      if (contactsList) {
        contactsList.innerHTML = `
          <p class="no-results">
            تعذر تحميل بيانات الموظفين
          </p>
        `;
      }

      if (statusText) {
        statusText.textContent =
          "تأكد من إعداد صلاحيات جدول employees في Supabase";
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const searchValue = event.target.value.trim().toLowerCase();

      const filteredContacts = contacts.filter((employee) => {
        return [
          employee.name,
          employee.job_title,
          employee.internal_number,
          employee.direct_number,
          employee.mobile_number
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(searchValue)
        );
      });

      showContacts(filteredContacts);

      if (statusText) {
        statusText.textContent =
          `عدد النتائج: ${filteredContacts.length}`;
      }
    });
  }

  loadContacts();
});
