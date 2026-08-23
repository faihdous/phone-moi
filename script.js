* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, Tahoma, sans-serif;
  background: #f2f5f8;
  color: #1d2939;
}

.header {
  background: linear-gradient(135deg, #063b5c, #087e8b);
  color: white;
  min-height: 190px;
  padding: 30px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
  text-align: center;
}

.logo {
  width: 105px;
  height: 105px;
  object-fit: contain;
  background: white;
  border-radius: 50%;
  padding: 8px;
}

.header h1 {
  margin: 0 0 12px;
  font-size: 28px;
}

.header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.container {
  width: 94%;
  max-width: 1100px;
  margin: 30px auto;
}

#searchInput {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  font-size: 17px;
  outline: none;
  background: white;
  margin-bottom: 20px;
}

#searchInput:focus {
  border-color: #087e8b;
  box-shadow: 0 0 0 3px rgba(8, 126, 139, 0.15);
}

#status {
  text-align: center;
  color: #667085;
  margin: 15px 0;
  font-size: 15px;
}

#contactsList {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: 18px;
}

.card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 14px rgba(16, 24, 40, 0.08);
  border-right: 5px solid #087e8b;
}

.card h2 {
  color: #063b5c;
  font-size: 19px;
  margin: 0 0 10px;
  line-height: 1.6;
}

.card .name {
  font-size: 17px;
  font-weight: bold;
  color: #344054;
  margin-bottom: 15px;
}

.info {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid #eaecf0;
  font-size: 14px;
}

.info:last-child {
  border-bottom: none;
}

.info strong {
  color: #667085;
}

.info span {
  color: #101828;
  direction: ltr;
  text-align: left;
  word-break: break-word;
}

.phone-link {
  color: #087e8b !important;
  text-decoration: none;
  font-weight: bold;
}

.phone-link:hover {
  text-decoration: underline;
}

.empty {
  grid-column: 1 / -1;
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  color: #667085;
}

footer {
  text-align: center;
  padding: 25px;
  color: #667085;
  font-size: 13px;
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;
    min-height: 220px;
  }

  .header h1 {
    font-size: 23px;
  }

  .header p {
    font-size: 14px;
  }

  #contactsList {
    grid-template-columns: 1fr;
  }
}
