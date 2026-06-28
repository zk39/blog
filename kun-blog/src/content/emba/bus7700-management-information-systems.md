---
course_code: "BUS 7700"
course_name: "Management of Information Systems"
title: "MIS Management Analysis Project Proposal (Part 2)"
description: "Group analysis of Uber's data privacy practices, cookie policy, cost modeling, and database design for a ride-sharing platform"
date: 2026/03/27
learning_outcome: "Develop and evaluate information systems strategies that support business goals, improve operational efficiency, and create sustainable competitive advantage."
status: "complete"
category: "core"
---

**MIS Management Analysis Project Proposal (Part 2)**

*Group 1: Rahul, Dinara Baimukhanova, Chun How Beh, Xingyu Liu, Kun Zhang*
Ottawa University · BUS-7700: Management Information Systems
Dr. Conrad Dela Cruz · March 27, 2026

---

## Data Collection on Website Visitors

Uber should collect only the data necessary to provide its services. This includes basic information such as name, email, phone number, and payment details for registered users, and limited technical data (e.g., IP address, browser type, and device information) for non-registered visitors. By tracking user activity, Uber can identify frequently visited pages, user engagement patterns, and feature usage. This information supports service improvement, marketing optimization, and fraud detection.

However, data collection raises privacy concerns. Users may feel uncomfortable with extensive tracking, and there is a risk of data breaches. Additionally, technologies such as WebRTC can reveal real IP addresses even when users employ VPNs. While this may enhance fraud prevention, it should only be used transparently and with user consent to maintain trust.

## Use of Cookies

Uber should use cookies to enhance functionality and user experience. Four types of cookies are recommended:

- **Strictly Necessary Cookies:** Essential for core functions such as login and transactions (cannot be disabled).
- **Performance Cookies:** Collect usage data to improve system performance (optional).
- **Functional Cookies:** Store user preferences for convenience (optional).
- **Advertising Cookies:** Track behavior for targeted advertising (opt-in required).

Cookies benefit Uber by improving analytics and marketing effectiveness, while users benefit from convenience and personalization. However, cookies may raise concerns about cross-site tracking and third-party data sharing. Therefore, Uber must clearly disclose cookie usage and provide user control over non-essential cookies.

## TrustArc Certification

Uber should collect only the data necessary to provide its services. This includes basic information such as name, email, phone number, and payment details for registered users, and limited technical data (e.g., IP address, browser type, and device information) for non-registered visitors. By tracking user activity, Uber can identify frequently visited pages, user engagement patterns, and feature usage. This information supports service improvement, marketing optimization, and fraud detection.

However, data collection raises privacy concerns. Users may feel uncomfortable with extensive tracking, and there is a risk of data breaches. According to TrustArc, organizations should limit data collection and ensure transparency when handling personal information (TrustArc, n.d.). Additionally, technologies such as WebRTC can reveal real IP addresses even when users employ VPNs. While this may enhance fraud prevention, it should only be used transparently and with user consent to maintain trust.

## Opt-in vs. Opt-out Model

The company should adopt a mixed approach to informed consent by using both opt-in and opt-out models depending on the type of data being collected. An opt-in model requires users to actively give permission before their data is collected, while an opt-out model allows data collection by default unless users choose to decline.

For sensitive data, such as personal information, location data, or third-party data sharing, an opt-in approach is recommended because it provides stronger privacy protection and aligns with regulations such as the General Data Protection Regulation. For less sensitive data, such as performance and functional cookies, an opt-out model may be appropriate, as it allows the company to improve user experience while still giving users control. This combined approach helps balance business needs with user privacy and increases overall user trust.

## Cost Comparison

Over a three-year period, the total cost of purchasing the software is $234,000, while the total cost of renting the software is $209,500. This means that the rental option is $24,500 less expensive than purchasing.

Although renting is more cost-effective in the short term, purchasing the software may provide greater control over system customization, data security, and long-term strategic flexibility. On the other hand, the rental SaaS option offers advantages such as scalability, reduced maintenance responsibility, and easier implementation. Therefore, while the rental option is financially more attractive, the final decision should also consider non-financial factors such as control, security, and future business needs.

## Database Design

The database consists of six related tables. The **Customers** table stores customer information with CustomerID as the primary key. The **Drivers** table contains driver details with DriverID as the primary key. The **Rides** table is the central transaction table using CustomerID and DriverID as foreign keys. The **Payments** table tracks payment records linked to Rides through RideID. The **Events** table stores marketing events, and the **EventAttendance** table handles the many-to-many relationship between Customers and Events.

The key relationships are: Customers to Rides (one-to-many), Drivers to Rides (one-to-many), Rides to Payments (one-to-one), and Customers to Events (many-to-many through EventAttendance).

## ERD

The database can support several useful reports for the marketing and sales departments. For example, a **repeat customer report** can identify customers who use the service frequently, which helps in designing loyalty programs. A **sales by location report** can show which cities or areas generate the most revenue, allowing the company to focus its marketing efforts.

A **ride pattern analysis report** shows peak usage times and popular routes, helping improve service efficiency and pricing strategies. The company can also generate **event participation reports** to analyze how many customers attend marketing events and whether these events increase customer activity.

In addition, **customer segmentation reports** can group customers based on factors such as usage frequency, spending level, or location. These reports help the company better understand its target market and create more effective marketing strategies.

## References

TrustArc. (n.d.). Privacy compliance and certification services. https://trustarc.com/

Uber Technologies Inc. (n.d.). Privacy notice for users in the United States. https://privacy.uber.com/us

Uber Technologies Inc. (n.d.). Privacy notice for drivers and delivery people. https://www.uber.com/global/en/privacy-notice-drivers-delivery-people
