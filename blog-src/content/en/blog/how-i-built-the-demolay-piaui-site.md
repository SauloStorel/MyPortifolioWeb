---
title: "How I built the DeMolay Piauí website"
description: "How I built the DeMolay Piauí website and registration store, my first real project: three versions, many challenges and what I learned with Rails."
date: 2026-11-17
translationKey: "como-fiz-o-site-do-demolay-piaui"
tags: ["rails", "demolay-piaui", "security"]
resumo:
  - "The DeMolay Piauí website was Saulo's first real project. He built it while he was State Master Councilor of Piauí, to solve problems in the organization: lost documents, hard-to-track accounts and registrations done through Google Forms, checked Pix by Pix."
  - "The project had three versions: first HTML, JS and CSS all mixed together; then React; and finally Rails, built from scratch when he started his internship at the FMS."
  - "The store uses InfinitePay's checkout, which accepts card, Pix and boleto, has a webhook with the payment status and low fees. Payment is confirmed through a single path that locks the batch in the database, so the same spot is never sold twice, and the next batch starts on its own."
  - "The raffle also went on the site. Numbers are reserved by locking rows in the database (FOR UPDATE SKIP LOCKED), so two buyers never get the same number, and unpaid reservations are released after 10 minutes. The draw saves its seed, and any participant can redo the math and reach the same winner."
  - "The admin panel is secured in layers: honeypot and Cloudflare Turnstile, attempt limits, passwords created through a one-time link, an audit trail and encrypted personal data. The financial report uses a temporary password that lasts 2 hours."
  - "The amount charged is always calculated on the server, and a coupon is only used once payment is confirmed. At check-in, a QR code shows kit, lodging and batch, and everyone who attended gets a certificate by email."
  - "Photos were slow to load in the store and the past administrations tab. They live on Cloudflare R2, with a CDN and one-year cache, and Rails now generates WebP versions in the background, cropped to the size each page uses. The cause was that the version generated beforehand was not the one the page asked for, so it was only processed on the first visit."
  - "At launch, the store got more than 100 registrations in 24 hours and more than 300 in total, with no problems. The project uses Rails 8.1, PostgreSQL, Hotwire, Tailwind, Docker with Kamal, Cloudflare R2, Resend and Sentry."
resumo_hash: "0c09eb18a85d"
---

The DeMolay Piauí website was my first real project, and it was a big challenge from start to finish. You can see the result on the [project page](/en/projects/demolay-piaui/) or at [demolaypiaui.com](https://demolaypiaui.com).

## The idea

The DeMolay Order is a para-masonic order and the largest organization for young men in the world. It takes in young people from 12 to 21 years old and aims to shape leaders and better citizens for society. It does philanthropy, entertainment and other activities.

I'm part of the Order and, at the time, I was the State Master Councilor of Piauí. That is the highest youth leadership position within a state, and whoever holds it is responsible for following the chapters and making sure the institution's rules are respected.

That's why I saw up close the problems of our state's organization: documents that got lost, difficulty recording accounts, difficulty creating forms for events and following each attendee's payment.

Before, everything was done with Google Forms. The person filled in the form, sent a Pix (Brazil's instant payment method) to the given key and attached the receipt. That was a lot of work, because every day someone had to check Pix by Pix, receipt by receipt. Many times Forms also had problems and the receipt couldn't be attached, which hurt the sale.

There was also the state's history, which often changed a bit because it was passed along by word of mouth and there was no proper place for it. We were missing a website that told the history, with the record of past administrations, the list of the state's organizations and the situation of each one. All of this was very hard to access because there was no official portal.

## The three versions

Since it was my first real project, there were several attempts. I made the first version with only HTML, JS and CSS, all mixed together in the files. A real mess.

The second was in React, and it was already good. That's when I was selected for the internship at the FMS, where we use Ruby on Rails, and I used the DeMolay Piauí project to learn and practice things that would improve my skills at the internship.

Then came the third version, built from scratch in Rails. Besides the difficulty with the Ruby language and the framework, I had several other challenges.

## The challenges

### Payment beyond Pix

How do I add a payment method besides Pix? That's when I found InfinitePay's checkout. It came with everything ready and accepts card, Pix and boleto (a Brazilian payment slip).

It also already has a webhook that returns the payment status: approved or declined. And it has another advantage: the fees are very low.

### The batches

How would it work when a batch ran out by number of registrations and switched automatically to the next one? And what if two people tried to buy the last spot of the same batch at the same time?

The solution was to confirm payment through a single path, the same one for the webhook, for the redirect and for the test environment. In it, the batch is locked in the database while the spot is checked, so only one confirmation goes through at a time and it's impossible to sell more spots than exist.

If the spot ran out before the payment was confirmed, the order is canceled, the transaction data is kept for the refund and the person is notified by email. Confirmation also doesn't repeat: if the webhook and the redirect arrive together, nothing happens twice, neither the email nor the use of the coupon.

The next batch starts on its own. When the current one runs out, the next one is promoted, and the cart follows the same rule, so nobody completes a purchase in a batch that has already ended.

### The raffle

After the registration store, the raffle also went on the site. The challenge was similar to the batches: two buyers can't get the same number.

The numbers live in their own table, which is the single source of truth about how many are left. At purchase time, the system reserves the numbers by locking the rows in the database (`FOR UPDATE SKIP LOCKED`): people buying at the same time skip the locked rows instead of waiting, and two orders never get the same number. It either reserves the whole quantity or nothing, so nobody pays for 3 and gets 2. If the payment doesn't happen, the numbers are released after 10 minutes. To be sure, I wrote a test with four real threads competing for the same stock: without the lock, it fails.

The draw is done with one click. The system draws and saves the seed, and any participant can redo the math, with the seed and the list of sold numbers, and reach the same winner.

### Payment confirmation

For payment confirmation, I discovered SMTP servers. I studied them to understand why to use them, what they do and what the advantages are. The emails go out through Resend.

### The admin panel and security

How would the administrative side of the site work, the admin panel? How would that area be secured and what would the login system be? That's when I learned about rate limiting, human verification and password encryption, among other security topics.

The panel deals with money and personal data, so protection is in layers, and none of them can lock the team out:

- **Human verification:** a honeypot field and, when configured, Cloudflare Turnstile. If the captcha service is down, login is still protected by the other layers.
- **Attempt limits:** login and password recovery limit attempts by IP and by email.
- **Passwords:** nobody sets anyone else's password. The administrator registers the person's email, and they receive a one-time link to create their own password. Password recovery answers the same way for registered or unregistered emails, so it doesn't reveal who has an account.
- **Audit:** every change to sensitive records goes into an audit trail that can only be read, never edited.
- **Privacy:** the personal data in orders is encrypted in the database, in line with the LGPD (Brazil's data protection law).

### Financial report

All DeMolays in the state have the right to see the financial report. People from outside the state or the organization don't need it, also for privacy and security. So the financial report tab uses a temporary password, which has to be generated by a site admin. Once generated, it lasts 2 hours, and the system records when and by whom it was generated, for a closer audit. The password is a hexadecimal code.

### Coupons and values from the front-end

Coupons led me to another problem I found while building the site: never trust values sent by the front-end. If someone with bad intentions intercepted the purchase request and changed the amount, they could give themselves a discount. The payment would be created with the amount they set, it would be approved, and so would the registration.

That's why the discount shown on screen is only a preview. The amount actually charged is always calculated on the server: the price comes from the database, the coupon's validity is checked again and the discount is recalculated when the order is created. Messing with the browser doesn't change what is charged. And the coupon is only used when the payment is confirmed, never when the order is created, so someone who abandons the checkout doesn't use up anyone's coupon.

### Check-in and certificates

At the congresses, the kits were counted and, in the end, someone ended up without a kit because of a mistake at check-in, which was manual.

Today, after the payment is checked, the person gets a QR code in the confirmation email. They show it at check-in and all their information appears: whether they have a kit or not, whether they have lodging or not and which batch they bought. All of this goes into an attendance list and, at the end of the congress, everyone who attended gets a participation certificate by email. It's all automated with tasks, and the emails go out through Resend.

### Images were slow to load

Another challenge was the images. When the store or the past administrations tab opened, the photos took much longer than normal to load.

The images live on Cloudflare R2 and are delivered through a CDN, with a one-year cache. But what really fixed it was what Rails did with them:

- **Ready-made versions:** after upload, the system generates in the background versions of the photo at the exact size each page uses, in WebP and already cropped on the server, so the browser doesn't download the whole photo.
- **The mistake I had:** the version generated in advance was not the same as the one the page asked for. So it was never used, and the image was only processed on the first visit, which caused the delay. Some photos (venue, hotel, lodging and the home page's top photo) weren't even prepared and went through a much slower path: 335 to 467 ms per photo, against about 130 ms through the CDN.
- **Above the fold:** the images that appear right when the page opens now load with priority and without depending on JavaScript. While the photo hasn't arrived, its space uses the image's average color instead of a white rectangle.

## The launch

None of this was done at once. It took several months of development, several hours a day and many tests, so that on the day the store launched, which was going to be the first part announced, none of these problems would happen.

The store was announced and we had more than 100 registrations in 24 hours, with no problems with payment or registration. Everything went as originally planned. In the end there were more than 300 registrations, 100% without problems, thanks to the care I took while building the features and testing them in many different ways. It cost me time, but in the end it saved me a lot of headaches.

## Technologies

- **Back-end:** Ruby on Rails 8.1, with Ruby 3.3 and PostgreSQL 16. Background jobs run on Solid Queue.
- **Front-end:** Hotwire (Turbo and Stimulus) and Tailwind CSS v4, with a custom design system in the admin panel.
- **Hosting:** a VPS running everything in Docker containers, with Kamal deploys without taking the site down. The SSL certificate is renewed automatically by Let's Encrypt.
- **Files:** Cloudflare R2, with a CDN for public images and private storage for receipts and documents.
- **Services:** InfinitePay for payments, Resend for emails, Sentry for monitoring and a daily database backup.

That's when I learned about GitHub's CI, which helped me a lot, and about Kamal, to deploy automatically through GitHub Actions.
