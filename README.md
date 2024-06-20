# Financial Glasses

Check the project out live at https://financial-glasses.vercel.app/

I used Intuit Mint for my budgeting needs since 2019. But since Mint has been migrated over to Credit Karma and doesn't have budgeting capabilities (and I need a web dev project to work on for my portfolio), Financial Glasses was born.

<!-- ![Financial Glasses home page](client\src\assets\financial-glasses-home-screenshot.png) -->
<img src="client\src\assets\financial-glasses-home-screenshot.png" style="width: 300px;"/>

This is a MERN stack project that uses the Plaid API to get access to bank information. I use Tailwind for CSS.

<div style="display: flex; gap: 20px;">
    <img src="client\src\assets\MERN.png" style="height: 150px;"/>
    <img src="client\src\assets\tailwind.webp" style="height: 150px;"/>
    <img src="client\src\assets\plaid.png" style="height: 150px;"/>
</div>

Here's how to get the code running on your computer:

## 1. Clone the Repo

(If you'd prefer to fork the repo first prior to cloning, knock yourself out)

If you use HTTPS, copy and paste the following code in your terminal of choice (I use Bash):

```
git clone https://github.com/ShieunSPark/financial-glasses.git
cd financial-glasses
```

If you use SSH, copy and paste the following:

```
git clone git@github.com:ShieunSPark/financial-glasses.git
cd financial-glasses
```

## 2. Set Up Environment Variables

Change the directory to `/server` and copy the `.env.example` file to a new `.env` file:

```
cd server/
cp .env.example .env
```

Open your new `.env` file and follow the instructions there. If you're unfamiliar with Mongo Atlas, Google Cloud Console, and/or Plaid, read up on documentation as needed.

Change the directory to `/client` and copy the `.env.example` file to a new `.env` file:

```
cd ..
cd client/
cp .env.example .env
```

## 3. Run the Website

In two separate terminals, start the server and the client with the following:

```
npm run dev
```
