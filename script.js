<script>
  const SUPABASE_URL =
    "https://hxdpfrnxawhyanjwvlmv.supabase.co";

  const SUPABASE_ANON_KEY =
    "sb_publishable_TLic-BebUrdemyOnDcKnnQ_MnlLJjgH";

  const TABLE_NAME = "employees";

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  const searchInput =
    document.getElementById("searchInput");

  const searchButton =
    document.getElementById("searchButton");

  const contactsList =
    document.getElementById("contactsList");

  const emptyMessage =
    document.getElementById("emptyMessage");

  let allContacts = [];

  function safe(value) {
    return value === null || value === undefined
      ? ""
      : String(value).trim();
  }

  function escapeHtml(value) {
    return safe(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeText(value) {
    return safe(value)
      .toLowerCase()
      .replace(/[\u200E\u200F\u202A-\u202E\u061C]/g, "")
      .replaceAll("أ", "ا")
      .replaceAll("إ", "ا")
      .replaceAll("آ", "ا")
      .replaceAll("ى", "ي")
      .replaceAll("ة", "ه")
      .replace(/\s+/g, " ");
  }

  function normalizeNumber(value) {
    return safe(value)
      .replace(/[\u200E\u200F\u202A-\u202E\u061C]/g, "")
      .replace(/[^\d+]/g, "");
  }

  function getName(contact) {
    return safe(
      contact["الإسم"] ||
      contact["الاسم"] ||
      contact["اسم الموظف"] ||
      contact["الاسم الكامل"] ||
      contact.name ||
      contact.full_name ||
      contact.employee_name
    );
  }

  function getJobTitle(contact) {
    return safe(
      contact["المسمى الوظيفي"] ||
      contact["المسمى الوظيفى"] ||
      contact["الوظيفة"] ||
      contact["المسمى"] ||
      contact.job_title ||
      contact.job ||
      contact.title
    );
  }

  function getInternalNumber(contact) {
    return safe(
      contact["الرقم الداخلي"] ||
      contact["الرقم الداخلى"] ||
      contact.internal_number
    );
  }

  function getDirectNumber(contact) {
    return safe(
      contact["الرقم المباشر"] ||
      contact["المباشر"] ||
      contact["الرقم المباشره"] ||
      contact.direct_number
    );
  }

  function getMobileNumber(contact) {
    return safe(
      contact["الهاتف المحمول"] ||
      contact["الجوال"] ||
      contact["رقم الجوال"] ||
      contact["الهاتف"] ||
      contact.mobile
    );
  }

  /*
    إنشاء مفتاح للموظف لمعرفة هل هو مكرر أم لا.
    الأولوية:
    1- الرقم الداخلي
    2- الرقم المباشر
    3- رقم الجوال
    4- الاسم
  */
  function getEmployeeKey(employee) {
    const internal = normalizeNumber(
      getInternalNumber(employee)
    );

    const direct = normalizeNumber(
      getDirectNumber(employee)
    );

    const mobile = normalizeNumber(
      getMobileNumber(employee)
    );

    const name = normalizeText(
      getName(employee)
    );

    if (internal) {
      return `internal:${internal}`;
    }

    if (direct) {
      return `direct:${direct}`;
    }

    if (mobile) {
      return `mobile:${mobile}`;
    }

    if (name) {
      return `name:${name}`;
    }

    return "";
  }

  function removeDuplicates(employees) {
    const result = [];
    const keys = new Set();

    employees.forEach(employee => {
      const key = getEmployeeKey(employee);

      if (!key) {
        return;
      }

      if (keys.has(key)) {
        return;
      }

      keys.add(key);
      result.push(employee);
    });

    return result;
  }

  function normalizePhone(value) {
    let phone = safe(value).replace(/\D/g, "");

    if (!phone) {
      return "";
    }

    if (phone.startsWith("00965")) {
      phone = phone.substring(2);
    }

    if (phone.startsWith("965")) {
      return phone;
    }

    return "965" + phone;
  }

  function showMessage(message, className = "") {
    contactsList.innerHTML = "";

    emptyMessage.className = "empty " + className;
    emptyMessage.innerHTML = message;
    emptyMessage.style.display = "flex";
  }

  function createDataRows(contact) {
    const fields = [
      [
        "الرقم الداخلي",
        getInternalNumber(contact),
        "landline"
      ],
      [
        "الرقم المباشر",
        getDirectNumber(contact),
        "landline"
      ],
      [
        "الهاتف المحمول",
        getMobileNumber(contact),
        "mobile"
      ]
    ];

    return fields
      .filter(field => safe(field[1]))
      .map(([label, value, type]) => {
        const phone = normalizePhone(value);
        const text = escapeHtml(value);

        if (type === "mobile") {
          return `
            <div class="data-row">
              <span class="data-label">📱 ${label}</span>

              <span class="data-value phone-value">
                <a
                  class="whatsapp-link"
                  href="https://wa.me/${phone}"
                  target="_blank"
                  rel="noopener noreferrer">
                  ${text} 🟢
                </a>
              </span>
            </div>
          `;
        }

        return `
          <div class="data-row">
            <span class="data-label">☎️ ${label}</span>

            <span class="data-value phone-value">
              <a href="tel:${phone}">
                ${text}
              </a>
            </span>
          </div>
        `;
      })
      .join("");
  }

  function displayContacts(contacts) {
    contactsList.innerHTML = "";

    const uniqueContacts =
      removeDuplicates(contacts);

    const namedContacts =
      uniqueContacts.filter(contact => getName(contact));

    if (!namedContacts.length) {
      showMessage("لا توجد نتائج مطابقة للاسم");
      return;
    }

    emptyMessage.style.display = "none";

    namedContacts.forEach(contact => {
      const card = document.createElement("article");

      card.className = "contact-card";

      const name = getName(contact);
      const job = getJobTitle(contact);

      card.innerHTML = `
        <div class="contact-name">
          ${escapeHtml(name)}
        </div>

        ${
          job
            ? `<div class="job-title">${escapeHtml(job)}</div>`
            : ""
        }

        ${createDataRows(contact)}
      `;

      contactsList.appendChild(card);
    });
  }

  async function loadContacts() {
    try {
      const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .select("*");

      if (error) {
        throw error;
      }

      const loadedContacts = data || [];

      // منع التكرار عند عرض البيانات
      allContacts = removeDuplicates(loadedContacts);

      console.log(
        "عدد السجلات في قاعدة البيانات:",
        loadedContacts.length
      );

      console.log(
        "عدد السجلات بعد إزالة التكرار:",
        allContacts.length
      );

    } catch (error) {
      console.error("Load contacts error:", error);

      showMessage(
        "تعذر تحميل البيانات من Supabase.<br>" +
        "تأكد من صلاحية قراءة جدول employees.",
        "error"
      );
    }
  }

  function searchContacts() {
    const search =
      normalizeText(searchInput.value);

    if (!search) {
      showMessage(
        "اكتب اسم الموظف ثم اضغط بحث"
      );
      return;
    }

    const results = allContacts.filter(contact =>
      normalizeText(getName(contact))
        .includes(search)
    );

    displayContacts(results);
  }

  searchButton.addEventListener(
    "click",
    searchContacts
  );

  searchInput.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        searchContacts();
      }
    }
  );

  searchInput.addEventListener(
    "input",
    () => {
      contactsList.innerHTML = "";

      emptyMessage.textContent =
        "اضغط بحث لعرض النتائج";

      emptyMessage.style.display = "flex";
    }
  );

  /* لوحة الإدارة */

  const adminSection =
    document.getElementById("adminSection");

  const showAdminLoginButton =
    document.getElementById("showAdminLoginButton");

  const adminLoginBox =
    document.getElementById("adminLoginBox");

  const adminPanel =
    document.getElementById("adminPanel");

  const adminEmail =
    document.getElementById("adminEmail");

  const adminPassword =
    document.getElementById("adminPassword");

  const adminLoginButton =
    document.getElementById("adminLoginButton");

  const adminLogoutButton =
    document.getElementById("adminLogoutButton");

  const adminLoginMessage =
    document.getElementById("adminLoginMessage");

  const adminMessage =
    document.getElementById("adminMessage");

  const employeeForm =
    document.getElementById("employeeForm");

  const employeeId =
    document.getElementById("employeeId");

  const employeeJob =
    document.getElementById("employeeJob");

  const employeeName =
    document.getElementById("employeeName");

  const employeeInternal =
    document.getElementById("employeeInternal");

  const employeeDirect =
    document.getElementById("employeeDirect");

  const employeeMobile =
    document.getElementById("employeeMobile");

  const saveEmployeeButton =
    document.getElementById("saveEmployeeButton");

  const cancelEditButton =
    document.getElementById("cancelEditButton");

  const adminSearch =
    document.getElementById("adminSearch");

  const adminEmployeesList =
    document.getElementById("adminEmployeesList");

  const csvFile =
    document.getElementById("csvFile");

  const uploadCsvButton =
    document.getElementById("uploadCsvButton");

  let adminEmployees = [];

  showAdminLoginButton.addEventListener(
    "click",
    () => {
      adminSection.style.display = "block";
      showAdminLoginButton.style.display = "none";

      adminSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  );

  function showAdminMessage(
    message,
    error = false
  ) {
    adminMessage.textContent = message;

    adminMessage.style.color =
      error ? "#c62828" : "#17346f";
  }

  async function isCurrentUserAdmin(user) {
    if (!user) {
      return false;
    }

    const { data, error } =
      await supabaseClient
        .from("admin_users")
        .select("email,is_admin")
        .ilike("email", user.email)
        .eq("is_admin", true)
        .maybeSingle();

    return !error && !!data;
  }

  async function checkAdminSession() {
    const { data } =
      await supabaseClient.auth.getSession();

    if (
      data.session &&
      await isCurrentUserAdmin(
        data.session.user
      )
    ) {
      showAdminPanel();
    }
  }

  function showAdminPanel() {
    adminSection.style.display = "block";
    adminLoginBox.style.display = "none";
    adminPanel.style.display = "block";
    showAdminLoginButton.style.display = "none";

    loadAdminEmployees();
  }

  adminLoginButton.addEventListener(
    "click",
    async () => {
      const email =
        adminEmail.value.trim();

      const password =
        adminPassword.value;

      if (!email || !password) {
        adminLoginMessage.textContent =
          "اكتب البريد الإلكتروني وكلمة المرور";
        return;
      }

      adminLoginMessage.textContent =
        "جاري تسجيل الدخول...";

      const { data, error } =
        await supabaseClient.auth
          .signInWithPassword({
            email,
            password
          });

      if (error) {
        adminLoginMessage.textContent =
          "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        return;
      }

      const admin =
        await isCurrentUserAdmin(data.user);

      if (!admin) {
        await supabaseClient.auth.signOut();

        adminLoginMessage.textContent =
          "هذا الحساب ليس لديه صلاحية مشرف";
        return;
      }

      adminLoginMessage.textContent = "";
      showAdminPanel();
    }
  );

  adminLogoutButton.addEventListener(
    "click",
    async () => {
      await supabaseClient.auth.signOut();

      adminPanel.style.display = "none";
      adminLoginBox.style.display = "block";
      adminSection.style.display = "none";
      showAdminLoginButton.style.display = "block";

      adminEmail.value = "";
      adminPassword.value = "";
    }
  );

  async function loadAdminEmployees() {
    const { data, error } =
      await supabaseClient
        .from(TABLE_NAME)
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {
      showAdminMessage(
        "تعذر تحميل قائمة الموظفين",
        true
      );
      return;
    }

    adminEmployees = data || [];

    displayAdminEmployees(adminEmployees);
  }

  function displayAdminEmployees(employees) {
    adminEmployeesList.innerHTML = "";

    if (!employees.length) {
      adminEmployeesList.innerHTML =
        "<p>لا توجد أسماء حاليًا</p>";
      return;
    }

    employees.forEach(employee => {
      const row =
        document.createElement("div");

      row.className =
        "admin-employee-row";

      row.innerHTML = `
        <div class="admin-employee-info">
          <strong>
            ${escapeHtml(getName(employee))}
          </strong>

          <small>
            ${escapeHtml(getJobTitle(employee))}
          </small>
        </div>

        <div class="admin-actions">
          <button class="edit-button">
            تعديل
          </button>

          <button class="delete-button">
            حذف
          </button>
        </div>
      `;

      row.querySelector(".edit-button")
        .addEventListener(
          "click",
          () => startEditEmployee(employee)
        );

      row.querySelector(".delete-button")
        .addEventListener(
          "click",
          () => deleteEmployee(employee.id)
        );

      adminEmployeesList.appendChild(row);
    });
  }

  adminSearch.addEventListener(
    "input",
    () => {
      const search =
        normalizeText(adminSearch.value);

      const filtered =
        adminEmployees.filter(employee =>
          normalizeText(
            getName(employee)
          ).includes(search)
        );

      displayAdminEmployees(filtered);
    }
  );

  employeeForm.addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      const employeeData = {
        "المسمى الوظيفي":
          employeeJob.value.trim(),

        "الإسم":
          employeeName.value.trim(),

        "الرقم الداخلي":
          employeeInternal.value.trim(),

        "الرقم المباشر":
          employeeDirect.value.trim(),

        "الهاتف المحمول":
          employeeMobile.value.trim()
      };

      if (!employeeData["الإسم"]) {
        showAdminMessage(
          "يرجى كتابة اسم الموظف",
          true
        );
        return;
      }

      const newEmployeeKey =
        getEmployeeKey(employeeData);

      /*
        فحص التكرار عند الإضافة اليدوية.
        لا نفحص السجل نفسه أثناء التعديل.
      */
      const duplicate =
        adminEmployees.find(employee => {
          if (
            employeeId.value &&
            String(employee.id) ===
            String(employeeId.value)
          ) {
            return false;
          }

          return (
            getEmployeeKey(employee) ===
            newEmployeeKey
          );
        });

      if (duplicate) {
        showAdminMessage(
          "هذا الموظف موجود مسبقًا، لم تتم إضافته",
          true
        );
        return;
      }

      let result;

      if (employeeId.value) {
        result = await supabaseClient
          .from(TABLE_NAME)
          .update(employeeData)
          .eq("id", employeeId.value);
      } else {
        result = await supabaseClient
          .from(TABLE_NAME)
          .insert([employeeData]);
      }

      if (result.error) {
        console.error(result.error);

        showAdminMessage(
          "حدث خطأ أثناء حفظ البيانات",
          true
        );
        return;
      }

      showAdminMessage(
        employeeId.value
          ? "تم تعديل بيانات الموظف بنجاح"
          : "تمت إضافة الموظف بنجاح"
      );

      resetEmployeeForm();

      await loadContacts();
      await loadAdminEmployees();
    }
  );

  function startEditEmployee(employee) {
    employeeId.value =
      employee.id || "";

    employeeJob.value =
      getJobTitle(employee);

    employeeName.value =
      getName(employee);

    employeeInternal.value =
      getInternalNumber(employee);

    employeeDirect.value =
      getDirectNumber(employee);

    employeeMobile.value =
      getMobileNumber(employee);

    saveEmployeeButton.textContent =
      "حفظ التعديل";

    window.scrollTo({
      top: adminPanel.offsetTop,
      behavior: "smooth"
    });
  }

  cancelEditButton.addEventListener(
    "click",
    resetEmployeeForm
  );

  function resetEmployeeForm() {
    employeeForm.reset();

    employeeId.value = "";

    saveEmployeeButton.textContent =
      "إضافة الموظف";
  }

  async function deleteEmployee(id) {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذا الموظف؟"
      )
    ) {
      return;
    }

    const { error } =
      await supabaseClient
        .from(TABLE_NAME)
        .delete()
        .eq("id", id);

    if (error) {
      console.error(error);

      showAdminMessage(
        "تعذر حذف الموظف",
        true
      );
      return;
    }

    showAdminMessage(
      "تم حذف الموظف بنجاح"
    );

    await loadContacts();
    await loadAdminEmployees();
  }

  function parseCsvLine(line) {
    const result = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (
          insideQuotes &&
          line[i + 1] === '"'
        ) {
          value += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (
        char === "," &&
        !insideQuotes
      ) {
        result.push(value.trim());
        value = "";
      } else {
        value += char;
      }
    }

    result.push(value.trim());

    return result.map(item =>
      item
        .replace(/^"|"$/g, "")
        .trim()
    );
  }

  uploadCsvButton.addEventListener(
    "click",
    () => {
      const file = csvFile.files[0];

      if (!file) {
        showAdminMessage(
          "اختر ملف CSV أولًا",
          true
        );
        return;
      }

      const reader =
        new FileReader();

      reader.onload = async event => {
        try {
          const lines =
            event.target.result
              .replace(/^\uFEFF/, "")
              .split(/\r?\n/)
              .filter(line => line.trim());

          if (lines.length < 2) {
            showAdminMessage(
              "ملف CSV فارغ أو غير صحيح",
              true
            );
            return;
          }

          const headers =
            parseCsvLine(lines[0])
              .map(header =>
                header.trim()
              );

          const employees =
            lines
              .slice(1)
              .map(line => {
                const values =
                  parseCsvLine(line);

                const row = {};

                headers.forEach(
                  (header, index) => {
                    row[header] =
                      values[index] || "";
                  }
                );

                return {
                  "المسمى الوظيفي":
                    row["المسمى الوظيفي"] ||
                    row["المسمى الوظيفى"] ||
                    row["الوظيفة"] ||
                    "",

                  "الإسم":
                    row["الإسم"] ||
                    row["الاسم"] ||
                    row["اسم الموظف"] ||
                    "",

                  "الرقم الداخلي":
                    row["الرقم الداخلي"] ||
                    row["الرقم الداخلى"] ||
                    "",

                  "الرقم المباشر":
                    row["الرقم المباشر"] ||
                    row["المباشر"] ||
                    "",

                  "الهاتف المحمول":
                    row["الهاتف المحمول"] ||
                    row["الجوال"] ||
                    row["رقم الجوال"] ||
                    ""
                };
              })
              .filter(employee =>
                getName(employee)
              );

          if (!employees.length) {
            showAdminMessage(
              "لم يتم العثور على أسماء داخل الملف",
              true
            );
            return;
          }

          /*
            إزالة التكرار داخل ملف CSV نفسه
          */
          const uniqueFromFile =
            removeDuplicates(employees);

          /*
            مقارنة الملف مع الموظفين الموجودين مسبقًا
          */
          const existingKeys =
            new Set(
              adminEmployees.map(employee =>
                getEmployeeKey(employee)
              )
            );

          const newEmployees =
            uniqueFromFile.filter(employee =>
              !existingKeys.has(
                getEmployeeKey(employee)
              )
            );

          const skippedCount =
            employees.length -
            newEmployees.length;

          if (!newEmployees.length) {
            showAdminMessage(
              `لم تتم إضافة أي موظف. جميع السجلات موجودة مسبقًا أو مكررة داخل الملف.`,
              true
            );
            return;
          }

          const { error } =
            await supabaseClient
              .from(TABLE_NAME)
              .insert(newEmployees);

          if (error) {
            console.error(error);

            showAdminMessage(
              "حدث خطأ أثناء رفع ملف CSV",
              true
            );
            return;
          }

          showAdminMessage(
            `تمت إضافة ${newEmployees.length} موظف. ` +
            `تم تجاهل ${skippedCount} سجل مكرر.`
          );

          csvFile.value = "";

          await loadContacts();
          await loadAdminEmployees();

        } catch (error) {
          console.error(
            "CSV upload error:",
            error
          );

          showAdminMessage(
            "حدث خطأ في قراءة ملف CSV",
            true
          );
        }
      };

      reader.readAsText(file, "UTF-8");
    }
  );

  loadContacts();
  checkAdminSession();
</script>
