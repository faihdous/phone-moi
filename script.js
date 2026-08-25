document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const contactsList = document.getElementById("contactsList");
  const statusText = document.getElementById("status");

  const SUPABASE_URL =
    "https://hxdpfrnxawhyanjwvlmv.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_TLic-BebUrdemyOnDcKnnQ_MnlLJjgH";

  const TABLE_NAME = "employees";

  let contacts = [];

  // تنظيف النص من المسافات والرموز المخفية
  function normalize(value) {
    return String(value ?? "")
      .replace(/[\u200E\u200F\u202A-\u202E\u061C]/g, "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  // تنظيف أرقام الهاتف والرقم الداخلي
  function normalizeNumber(value) {
    return normalize(value).replace(/[^\d+]/g, "");
  }

  // إنشاء معرف فريد لكل موظف
  function getEmployeeKey(employee) {
    const internalNumber = normalizeNumber(
      employee["الرقم الداخلي"]
    );

    const directNumber = normalizeNumber(
      employee["المباشر"] ||
      employee["الرقم المباشر"]
    );

    const mobileNumber = normalizeNumber(
      employee["الجوال"] ||
      employee["الهاتف المحمول"] ||
      employee["رقم الجوال"]
    );

    const name = normalize(
      employee["الاسم"] ||
      employee["الإسم"]
    );

    // الأولوية للرقم الداخلي
    if (internalNumber) {
      return `internal:${internalNumber}`;
    }

    // ثم الرقم المباشر
    if (directNumber) {
      return `direct:${directNumber}`;
    }

    // ثم رقم الجوال
    if (mobileNumber) {
      return `mobile:${mobileNumber}`;
    }

    // وأخيرًا الاسم
    if (name) {
      return `name:${name}`;
    }

    return null;
  }

  // إزالة الموظفين المكررين
  function removeDuplicates(data) {
    const uniqueEmployees = [];
    const usedKeys = new Set();

    data.forEach((employee) => {
      const employeeKey = getEmployeeKey(employee);

      // تجاهل الصفوف الفارغة
      if (!employeeKey) {
        return;
      }

      // تجاهل الموظف إذا كان مكررًا
      if (usedKeys.has(employeeKey)) {
        return;
      }

      usedKeys.add(employeeKey);
      uniqueEmployees.push(employee);
    });

    return uniqueEmployees;
  }

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
        <h3>
          ${escapeHTML(
            employee["الاسم"] ||
            employee["الإسم"] ||
            "بدون اسم"
          )}
        </h3>

        <p class="job-title">
          ${escapeHTML(
            employee["المسمى الوظيفي"] ||
            ""
          )}
        </p>

        <div class="contact-details">

          <p>
            <strong>الرقم الداخلي:</strong>
            ${escapeHTML(
              employee["الرقم الداخلي"] ||
              ""
            )}
          </p>

          <p>
            <strong>الرقم المباشر:</strong>
            ${escapeHTML(
              employee["المباشر"] ||
              employee["الرقم المباشر"] ||
              ""
            )}
          </p>

          <p>
            <strong>رقم الجوال:</strong>
            ${escapeHTML(
              employee["الجوال"] ||
              employee["الهاتف المحمول"] ||
              employee["رقم الجوال"] ||
              ""
            )}
          </p>

        </div>
      `;

      contactsList.appendChild(card);
    });
  }

  async function loadContacts() {
    try {
      if (statusText) {
        statusText.textContent =
          "جاري تحميل بيانات الموظفين...";
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

      const allContacts = await response.json();

      // حذف التكرار قبل عرض البيانات
      contacts = removeDuplicates(allContacts);

      showContacts(contacts);

      if (statusText) {
        statusText.textContent =
          `تم تحميل ${contacts.length} جهة اتصال`;
      }

      console.log(
        `عدد السجلات من Supabase: ${allContacts.length}`
      );

      console.log(
        `عدد السجلات بعد حذف التكرار: ${contacts.length}`
      );

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
      const searchValue = normalize(event.target.value);

      const filteredContacts = contacts.filter((employee) => {
        return [
          employee["الاسم"],
          employee["الإسم"],
          employee["المسمى الوظيفي"],
          employee["الرقم الداخلي"],
          employee["المباشر"],
          employee["الرقم المباشر"],
          employee["الجوال"],
          employee["الهاتف المحمول"],
          employee["رقم الجوال"]
        ].some((value) =>
          normalize(value).includes(searchValue)
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
