# Deploy Your First Website using Apache on Ubuntu

## 🎯 Objective

In this lab, you will:

* Install the Apache Web Server
* Run it inside your Ubuntu VM (Desktop or Server)
* View the default webpage
* Replace it with your own **TN Snacks Shop website**
* Successfully deploy your first website 🎉

---

## 🖥️ Prerequisites

Make sure you have:

* A working **Ubuntu VM** (Desktop or Server)
* Internet connection inside the VM
* Basic terminal knowledge
* Your **TN Snacks Shop `index.html` file**

---

## 📌 Step 1: Update System Packages

Open Terminal and run:

```bash
sudo apt update
```

👉 This ensures your package list is up to date.

---

## 📌 Step 2: Install Apache Web Server

Run the following command:

```bash
sudo apt install apache2 -y
```

👉 This installs the Apache web server.

---

## 📌 Step 3: Start and Enable Apache

Start Apache:

```bash
sudo systemctl start apache2
```

Enable it to start automatically on boot:

```bash
sudo systemctl enable apache2
```

Check status:

```bash
sudo systemctl status apache2
```

👉 You should see **active (running)**

---

## 🌐 Step 4: Test Apache in Browser

Open a browser **inside your VM** and go to:

```
http://localhost
```

 or 
 
```
sudo apt install curl -y

curl http://localhost
```

✅ You should see the Apache default page:

> **"Apache2 Ubuntu Default Page – It works!"**

🎉 This confirms Apache is working.

---

## 📂 Step 5: Understand Web Root Directory

Apache serves files from:

```
/var/www/html/
```

Check contents:

```bash
ls /var/www/html/
```

👉 You’ll see `index.html` (default page)

---

## ⚠️ Step 6: Backup Default Page (Important!)

Before replacing:

```bash
sudo cp /var/www/html/index.html /var/www/html/index.html.bak
```

---

## 📥 Step 7: Copy Your TN Snacks Shop Website

### Option A: If file is already inside VM

Navigate to your file location:

```bash
cd ~/Downloads
```

Copy it:

```bash
sudo cp index.html /var/www/html/
```

---

### Option B: If using USB / Shared Folder

Locate your file and copy:

```bash
sudo cp /path/to/your/index.html /var/www/html/
```

---

## 🔁 Step 8: Refresh the Website

Go back to browser and refresh:

```
http://localhost
```

 or 
 
```
sudo apt install curl -y

curl http://localhost
```

🎉 You should now see your **TN Snacks Shop website** instead of the default page!

---

## 🛠️ Step 9: Fix Permissions (if needed)

If the page doesn’t load properly:

```bash
sudo chmod 644 /var/www/html/index.html
```

---

## 🔍 Step 10: Verify Deployment

Checklist:

* [ ] Apache installed
* [ ] Apache running
* [ ] Default page visible
* [ ] Custom page replaced
* [ ] Website loads successfully

---
