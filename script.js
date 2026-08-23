document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const contactsList = document.getElementById("contactsList");
  const statusText = document.getElementById("status");

  /*
    ضع بيانات جهات الاتصال هنا
    ويمكنك لاحقًا ربطها بقاعدة البيانات بدون تغيير التصميم
  */
  const contacts = [
    {
      job_title: "مدير الإدارة",
      name: "مثال للاسم",
      internal_number: "1234",
      direct_number: "22222222",
      mobile_number: "50000000"
    },
    {
      job_title: "رئيس القسم",
      name: "مثال آخر",
      internal_number: "5678",
      direct_number: "33333333",
      mobile_number: "51111111"
    }
  ];

  function showContacts(data) {
    if (!contactsList) return;

    contactsList.innerHTML = "";

    if (data.length === 0) {
      contactsList.innerHTML = `
        <p class="no-results">لا توجد نتائج</p>
      `;

      if (statusText) {
        statusText.textContent = "لا توجد نتائج";
      }

      return;
    }

    data.forEach((contact) => {
      const card = document.createElement("div");

      /*
        مهم:
        استخدمنا نفس أسماء الكلاسات المعتادة،
        لذلك لا نغيّر ملف style.css
      */
      card.className = "contact-card";

      card.innerHTML = `
        <h3>${contact.job_title || ""}</h3>
        <h4>${contact.name || ""}</h4>

        <div class="contact-info">
          <span>الرقم الداخلي</span>
          <strong>${contact.internal_number || "-"}</strong>
        </div>

        <div class="contact-info">
          <span>الرقم المباشر</span>
          <strong>${contact.direct_number || "-"}</strong>
        </div>

        <div class="contact-info">
          <span>رقم الجوال</span>
          <strong>${contact.mobile_number || "-"}</strong>
        </div>
      `;

      contactsList.appendChild(card);
    });

    if (statusText) {
      statusText.textContent = `عدد النتائج: ${data.length}`;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const searchValue = event.target.value.trim().toLowerCase();

      const filteredContacts = contacts.filter((contact) => {
        return Object.values(contact)
          .join(" ")
          .toLowerCase()
          .includes(searchValue);
      });

      showContacts(filteredContacts);
    });
  }

  showContacts(contacts);
});
