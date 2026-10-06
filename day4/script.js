const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

function updateCounts() {
  const text = noteText.value;
  const characterCount = text.length;
  const trimmedText = text.trim();

  let words = 0;

  if (trimmedText !== "") {
    words = trimmedText.split(/\s+/).length;
  }

  charCount.textContent = `${characterCount} / 200 characters`;
  wordCount.textContent = `${words} words`;

  charCount.classList.remove("warning", "over");
  if (characterCount > 200) {
    charCount.classList.add("over");
  } else if (characterCount > 180) {
    charCount.classList.add("warning");
  }
}

function saveDraft() {
  localStorage.setItem("noteDraft", noteText.value);
}

noteText.addEventListener("input", function () {
  updateCounts();
  saveDraft();
});

function clearNote() {
  noteText.value = "";
  updateCounts();
  localStorage.removeItem("noteDraft");
}

clearBtn.addEventListener("click", clearNote);

noteText.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    clearNote();
  }
});

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "Light mode";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "Dark mode";
    localStorage.setItem("theme", "light");
  }
});

const savedDraft = localStorage.getItem("noteDraft");

if (savedDraft !== null) {
  noteText.value = savedDraft;
}

/* Restore saved theme */

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "Light mode";
} else {
  themeToggle.textContent = "Dark mode";
}

/* Update counters when page loads */

updateCounts();
