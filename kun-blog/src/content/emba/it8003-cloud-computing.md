---
course_code: "IT 8003"
course_name: "Cloud Computing"
title: "Analyzing Cloud Storage Disk Type and Capabilities"
description: "Comparative analysis of cloud storage types for three real-world scenarios: personal media, startup e-commerce, and financial services"
date: 2025/04/20
learning_outcome: "Evaluate cloud computing models and service providers to develop migration strategies that optimize cost, scalability, security, and business agility."
status: "complete"
category: "it"
---

**Analyzing Cloud Storage Disk Type and Capabilities**

*Kun Zhang*<br>
Ottawa University · IT 8003: Cloud Computing<br>
Dr. Cyndi (CK) Lambach · April 20, 2025

---

## Understanding Cloud Storage Disk Type and Capabilities

Cloud storage plays a critical role in how individuals and businesses store, manage, and access data. With the advancement of cloud computing technology, service providers now offer a diverse range of storage disk types and capabilities, which can allow customers to tailor storage solutions based on their specific needs. From high-performance solid-state drives (SSDs) to cost-effective archival storage options, the choice of disk type depends on factors such as access frequency, performance requirements, and data sensitivity. Some storage types are influenced by the underlying recording technologies — Conventional Magnetic Recording (CMR) and Shingled Magnetic Recording (SMR) — which can affect performance characteristics such as read/write speeds and suitability for frequent data access. This essay explores three different real-world scenarios — a young family sharing personal media, a startup company launching an e-commerce site, and a financial firm facilitating online stock trading — to determine the most appropriate cloud storage solutions for each case.

## Personal Media Storage for Families

For a young family that wants to have shared photos and videos, a combination of cloud-based object storage, archival storage tiers, and a home Network Attached Storage (NAS) provides the most flexible and cost-effective solution. As a family storage database, the content is typically multimedia such as vacation videos and pictures, and this data will not be accessed every day. Services like Azure Archive Storage can keep older files safely at a much lower cost. These cloud services are reliable, easy to use, and provide ways to share files through links, making them perfect for families with less technical experience. Archival storage types often use Shingled Magnetic Recording (SMR) disks, which are designed to store large amounts of data at a lower price. These drives are slower when writing new data frequently, but they are good for files that are written once and only opened occasionally — such as photos and videos.

Another solution could be using a home NAS device to store all multimedia data. NAS systems such as the Synology DS920+ provide a user-friendly, home-network-based cloud storage solution. The maximum available size for a single NAS drive of the Synology DS920+ is about 16 TB (Benjamin, 2023). The pros of using NAS include customized storage, more privacy, and no monthly fee since the data is stored locally. The cons are that customers may need manual configuration, and NAS does not protect against disasters like fire or theft as effectively as cloud storage does. An ideal solution for this case would be using a NAS at home for easy local access, combined with cloud storage as an offsite backup.

## Cloud Storage for a Startup E-Commerce Business

A small startup that wants to sell handmade slippers and scarves online needs storage that is fast, affordable, and reliable. A good choice is to combine block storage and object storage in the cloud. Block storage, such as Amazon EBS or Azure Managed Disks, is useful for running the website and storing the database, since it offers fast and stable performance (Microsoft, 2025). Object storage, such as Amazon S3 or Google Cloud Storage, is better for saving product photos, customer reviews, and videos, which do not change often but need to load quickly.

To save money, the company can choose cheaper storage tiers for files that are not used often. For example, old product images can be moved to archival storage like Amazon Glacier, which is significantly cheaper. For extra safety, the startup can also use a home or office NAS device such as the Synology DS920+ (Benjamin, 2023). These are simple to use and help store daily backups of files locally. If the cloud goes down or there is a small mistake, the NAS copy can help restore data. However, since NAS is a local device, it should not be the only backup. Cloud storage is still more secure and accessible from anywhere. This setup gives the business flexibility to grow without needing to manage physical servers or spending heavily at the outset.

## Secure Cloud Storage for a Financial Services Company

A new financial company that lets users buy and sell stock online needs the most secure and reliable cloud storage. These companies handle sensitive data such as personal information, bank accounts, and trading history, and must therefore meet high safety standards and follow regulations such as SOC 2, PCI DSS, and GDPR. For this reason, cloud block storage from trusted providers like Amazon Elastic Block Store (EBS) is the best option for their database and applications. It offers low latency, strong encryption, and fast backups.

Amazon EBS provides block-level storage volumes that can be attached to Amazon EC2 instances, offering high availability and durability. According to Tillu (2021), EBS volumes are designed for applications that require consistent and low-latency performance, making them ideal for transactional databases and critical workloads. For EBS volume types, SSDs are preferred over CMR hard drives due to their superior performance. SSD-backed volumes — such as General Purpose SSD (gp3) and Provisioned IOPS SSD (io1/io2) — deliver high input/output operations per second (IOPS) and low latency. These characteristics are essential for financial applications where rapid data access and processing are crucial. In contrast, CMR-based hard drives are more suitable for workloads with large, sequential data access patterns and are not optimized for the random I/O patterns typical in financial transactions.

## References

Benjamin, B. (2023, March 30). Synology review: How a NAS can enhance your Apple device experience. *9to5Mac.* https://9to5mac.com/2023/03/30/synology-review-nas-for-apple-users/

Tillu, J. (2021). What is Amazon elastic block storage? *Medium.* https://jaytillu.medium.com/what-is-amazon-elastic-block-storage-aa1195a725fc

Microsoft. (2025, April 1). Overview of Azure disk storage — Azure virtual machines. *Microsoft Learn.* https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview
