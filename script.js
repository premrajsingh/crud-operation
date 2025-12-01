// DOM elements
let regform = document.querySelector(".user-register");
let allInput = document.querySelectorAll(".inputs");
let allbtn = regform.querySelectorAll("button");
let closebtn = document.querySelector(".btn-close");
let regList = document.querySelector(".reg-list");
let addBtn = document.querySelector(".add-btn");
let searchEl = document.querySelector(".search");
let allBtnDel = document.querySelector(".delete-Allbtn");
let pagination = document.querySelector(".pagination-box");
let prevBtn = document.querySelector(".prev-btn");
let nextBtn = document.querySelector(".next-btn");

// Backend API base URL (must match your Node/Express server)
const API_BASE = "http://localhost:5000/api/employees";

let alldata = [];   // master data source (from backend or localStorage)
let url = "";       // profile image data URL
let allpagBtn = []; // pagination buttons reference
let useBackend = true; // true -> use MongoDB API, false -> use localStorage only

// ---------------------- STORAGE HELPERS --------------------------

const loadFromLocal = () => {
  const stored = localStorage.getItem("alldata");
  alldata = stored ? JSON.parse(stored) : [];
};

const saveToLocal = () => {
  localStorage.setItem("alldata", JSON.stringify(alldata));
};

// ---------------------- CRUD OPERATIONS --------------------------

// Create employee (form submit)
regform.onsubmit = async (e) => {
  e.preventDefault();

  // simple duplicate email check on client side
  let checkEmail = alldata.find((data) => data.email == allInput[1].value);

  if (checkEmail == undefined) {
    const payload = {
      name: allInput[0].value,
      email: allInput[1].value,
      mobile: allInput[3].value,
      dob: allInput[2].value,
      password: allInput[4].value,
      profile: url == "" ? "./assest/pngtree-wolf-logo-png-image_2306634.jpg " : url,
    };

    if (useBackend) {
      try {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Failed to create employee");
        }

        swal("Data inserted", "sucessfully", "success");
        closebtn.click();
        regform.reset();
        url = "";
        await fetchEmployeesAndRender();
      } catch (err) {
        // backend failed → fall back to localStorage
        console.warn("Backend create failed, falling back to localStorage", err);
        useBackend = false;
        loadFromLocal();
        const localPayload = { ...payload, _id: Date.now().toString() };
        alldata.push(localPayload);
        saveToLocal();
        swal("Offline mode", "Data saved in browser storage", "info");
        closebtn.click();
        regform.reset();
        url = "";
        buildPagination();
      }
    } else {
      // localStorage-only mode
      const localPayload = { ...payload, _id: Date.now().toString() };
      alldata.push(localPayload);
      saveToLocal();
      swal("Data inserted", "saved in browser storage", "success");
      closebtn.click();
      regform.reset();
      url = "";
      buildPagination();
    }
  } else {
    swal("Already Data Exists", "Failed", "warning");
  }
};

// Render table rows for given slice
const getRegData = (skiped, loaded) => {
  let divideData = alldata.slice(skiped, loaded);
  regList.innerHTML = "";
  divideData.forEach((data, index) => {
    let datastr = JSON.stringify(data);
    let finaldata = datastr.replace(/"/g, "'");
    regList.innerHTML += `
         <tr>
            <td>${index + 1}</td>
            <td>
                <img src="${data.profile}" width="30">
            </td>
            <td>${data.name}</td>
            <td>${data.email}</td>
            <td>${(data.dob || "").toString().slice(0, 10)}</td>
            <td>${data.mobile}</td>
            <td>
                <button data="${finaldata}" data-id="${data._id}" class="edit-btn btn btn-primary p-1 px-2"><i class="fa-solid fa-pen-to-square "></i></button>
                <button data-id="${data._id}" class="del-btn btn btn-danger p1 px-2"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
  });
  action();
};

// Attach edit/delete handlers
let action = () => {
  // deleting single employee
  let alldb = regList.querySelectorAll(".del-btn");
  for (let dbtn of alldb) {
    dbtn.onclick = async () => {
      let isconfirm = await confirm();
      if (isconfirm) {
        let id = dbtn.getAttribute("data-id");
        if (useBackend) {
          try {
            const res = await fetch(`${API_BASE}/${id}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              throw new Error("Failed to delete employee");
            }
            await fetchEmployeesAndRender();
          } catch (err) {
            console.warn("Backend delete failed, falling back to localStorage", err);
            useBackend = false;
            loadFromLocal();
            alldata = alldata.filter((emp) => emp._id !== id);
            saveToLocal();
            buildPagination();
          }
        } else {
          // local mode
          alldata = alldata.filter((emp) => emp._id !== id);
          saveToLocal();
          buildPagination();
        }
      }
    };
  }

  // editing employee (open modal, then update in DB)
  let alledtbtn = regList.querySelectorAll(".edit-btn");
  for (let edbtn of alledtbtn) {
    edbtn.onclick = () => {
      let id = edbtn.getAttribute("data-id");
      let datastr = edbtn.getAttribute("data");
      let datafinal = datastr.replace(/'/g, '"');
      let data = JSON.parse(datafinal);
      addBtn.click();
      allInput[0].value = data.name;
      allInput[1].value = data.email;
      allInput[2].value = (data.dob || "").toString().slice(0, 10);
      allInput[3].value = data.mobile;
      allInput[4].value = data.password;
      url = data.profile;
      allbtn[0].disabled = false; // update button
      allbtn[1].disabled = true;  // register button

      allbtn[0].onclick = async () => {
        const payload = {
          name: allInput[0].value,
          email: allInput[1].value,
          mobile: allInput[3].value,
          dob: allInput[2].value,
          password: allInput[4].value,
          profile: url == "" ? "./assest/pngtree-wolf-logo-png-image_2306634.jpg " : url,
        };

        if (useBackend) {
          try {
            const res = await fetch(`${API_BASE}/${id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              throw new Error("Failed to update employee");
            }

            swal("Data updated ", "sucessfully", "success");
            closebtn.click();
            regform.reset();
            allbtn[1].disabled = false;
            allbtn[0].disabled = true;
            await fetchEmployeesAndRender();
          } catch (err) {
            console.warn("Backend update failed, falling back to localStorage", err);
            useBackend = false;
            loadFromLocal();
            const idx = alldata.findIndex((emp) => emp._id === id);
            if (idx !== -1) {
              alldata[idx] = { ...alldata[idx], ...payload };
              saveToLocal();
            }
            swal("Data updated ", "saved in browser storage", "success");
            closebtn.click();
            regform.reset();
            allbtn[1].disabled = false;
            allbtn[0].disabled = true;
            buildPagination();
          }
        } else {
          const idx = alldata.findIndex((emp) => emp._id === id);
          if (idx !== -1) {
            alldata[idx] = { ...alldata[idx], ...payload };
            saveToLocal();
          }
          swal("Data updated ", "saved in browser storage", "success");
          closebtn.click();
          regform.reset();
          allbtn[1].disabled = false;
          allbtn[0].disabled = true;
          buildPagination();
        }
      };
    };
  }
};

// deleting all employees (DB or local)
allBtnDel.onclick = async () => {
  let isconfirm = await confirm();
  if (isconfirm) {
    if (useBackend) {
      try {
        const res = await fetch(API_BASE, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Failed to delete all employees");
        }
        await fetchEmployeesAndRender();
      } catch (err) {
        console.warn("Backend delete-all failed, falling back to localStorage", err);
        useBackend = false;
        alldata = [];
        saveToLocal();
        buildPagination();
      }
    } else {
      alldata = [];
      saveToLocal();
      buildPagination();
    }
  }
};

// reading profile image
allInput[5].addEventListener("change", () => {
  let freader = new FileReader();
  freader.readAsDataURL(allInput[5].files[0]);
  freader.onload = function (event) {
    url = event.target.result;
  };
});

// confirmation alert
let confirm = () => {
  return new Promise((resolve, reject) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this imaginary file!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        resolve(true);
        swal("Poof! Your imaginary file has been deleted!", {
          icon: "success",
        });
      } else {
        reject(false);
        swal("Your imaginary file is safe!");
      }
    });
  });
};

// ---------------------- SEARCH --------------------------

searchEl.oninput = () => {
  search();
};

search = () => {
  let value = searchEl.value.toLowerCase();
  let allTr = regList.querySelectorAll("TR");
  let i;
  for (i = 0; i < allTr.length; i++) {
    let allTd = allTr[i].querySelectorAll("TD");
    let name = allTd[2].innerHTML;
    let email = allTd[3].innerHTML;
    let phone = allTd[5].innerHTML;
    if (name.toLocaleLowerCase().indexOf(value) != -1) {
      allTr[i].style.display = "";
    } else if (email.toLocaleLowerCase().indexOf(value) != -1) {
      allTr[i].style.display = "";
    } else if (phone.toLocaleLowerCase().indexOf(value) != -1) {
      allTr[i].style.display = "";
    } else {
      allTr[i].style.display = "none";
    }
  }
};

// ---------------------- PAGINATION --------------------------

const controlPrevAndNextBtn = (allpagBtn, currIdx) => {
  let length = allpagBtn.length - 1;
  if (length == currIdx) {
    nextBtn.disabled = true;
    prevBtn.disabled = false;
  } else if (currIdx > 0) {
    nextBtn.disabled = false;
    prevBtn.disabled = false;
  } else {
    nextBtn.disabled = false;
    prevBtn.disabled = true;
  }
};

const buildPagination = () => {
  pagination.innerHTML = "";
  let length = Number(alldata.length / 5);
  let i,
    skip = 0,
    load = 5;
  if (length.toString().indexOf(".") !== -1) {
    length = length + 1;
  }
  for (i = 1; i <= length; i++) {
    pagination.innerHTML += ` <button data-skip="${skip}" data-load="${load}" class="btn paginate-btn bg-dark text-white">${i}</button>`;
    skip += 5;
    load += 5;
  }
  allpagBtn = pagination.querySelectorAll(".paginate-btn");
  if (allpagBtn.length > 0) {
    allpagBtn[0].classList.add("active");
    getRegData(0, 5);
  } else {
    regList.innerHTML = "";
  }
  allpagBtn.forEach((pagBtn, index) => {
    pagBtn.addEventListener("click", function () {
      controlPrevAndNextBtn(allpagBtn, index);
      for (let el of allpagBtn) {
        el.classList.remove("active");
      }
      this.classList.add("active");
      let dataSkip = this.getAttribute("data-skip");
      let dataLoad = this.getAttribute("data-load");
      getRegData(parseInt(dataSkip), parseInt(dataLoad));
    });
  });

  nextBtn.onclick = () => {
    let currIdx = 0;
    allpagBtn.forEach((btn, index) => {
      if (btn.classList.contains("active")) {
        currIdx = index + 1;
      }
    });
    if (allpagBtn[currIdx]) {
      allpagBtn[currIdx].click();
      controlPrevAndNextBtn(allpagBtn, currIdx);
    }
  };

  prevBtn.onclick = () => {
    let currIdx = 0;
    allpagBtn.forEach((btn, index) => {
      if (btn.classList.contains("active")) {
        currIdx = index - 1;
      }
    });
    if (allpagBtn[currIdx]) {
      allpagBtn[currIdx].click();
      controlPrevAndNextBtn(allpagBtn, currIdx);
    }
  };
};

// Fetch employees from backend and render (with fallback to localStorage)
const fetchEmployeesAndRender = async () => {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      throw new Error("Failed to fetch employees");
    }
    alldata = await res.json();
    useBackend = true;
    buildPagination();
  } catch (err) {
    console.warn("Backend fetch failed, using localStorage instead", err);
    useBackend = false;
    loadFromLocal();
    buildPagination();
  }
};

// initial load
fetchEmployeesAndRender();

// ---------------------- THEME TOGGLING --------------------------

const bodyEl = document.querySelector(".app-body");
const themeToggleBtn = document.querySelector(".theme-toggle");

const applyTheme = (theme) => {
  if (!bodyEl) return;
  if (theme === "light") {
    bodyEl.classList.remove("theme-dark");
    bodyEl.classList.add("theme-light");
  } else {
    bodyEl.classList.remove("theme-light");
    bodyEl.classList.add("theme-dark");
    theme = "dark";
  }
  localStorage.setItem("crud-theme", theme);
};

const storedTheme = localStorage.getItem("crud-theme");
if (storedTheme === "light" || storedTheme === "dark") {
  applyTheme(storedTheme);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isCurrentlyDark = bodyEl.classList.contains("theme-dark");
    applyTheme(isCurrentlyDark ? "light" : "dark");
  });
}