---
course_code: "IT 7003"
course_name: "Network Essentials"
title: "Enterprise Network Diagram Analysis"
description: "Security analysis of a hybrid enterprise network, identifying ten vulnerability areas and proposing mitigations"
date: 2025/11/30
learning_outcome: "Assess enterprise network requirements, evaluate infrastructure design options, and articulate the business impact of network architecture decisions."
status: "complete"
category: "it"
---

**Enterprise Network Diagram Analysis**

*Kun Zhang*
Ottawa University · IT-7003: Network Essentials
Dr. Cyndi (CK) Lambach · November 30, 2025

---

## Network Diagram Selection

The network diagram I selected for this analysis is a Hybrid Enterprise Network. It includes several key areas: Edge, Experimental, Internet DMZ, Storage, Datacenter, and Management. This network is interesting because it supports different functions, from facing the public internet to handling internal data and management. It uses various devices like firewalls, switches, Single-Board Computers, and a Network Attached Storage. The complexity of this network, with its many connections and services like PXE, NFS, and reverse proxies, means there are multiple potential points that attackers could target.

The Edge zone contains the firewall and reverse proxy, which handle incoming traffic from the Internet. The DMZ hosts public-facing services like web servers and mail gateways. The Datacenter includes application servers and database servers that hold sensitive company data. The Storage and Management networks are separated for backup, monitoring, and administrative control. This multi-layer structure makes the diagram suitable for analyzing attack surfaces such as misconfigurations, vulnerable applications, and weak access control policies. Because each area plays a different role in the overall system, the diagram helps demonstrate how attackers might move through a network and which defenses can reduce these risks.

Overall, I selected this diagram because it allows a deeper and more realistic discussion about enterprise level security. It contains enough components to explore technical threats, policy issues, and administrative problems that many real organizations face today.

## Network Security

After reviewing the network diagram, I identified ten major areas where security could be improved. Since this is a static diagram without real devices to test, I used common weaknesses found in similar enterprise networks.

### SQL Injection

In the DMZ, web applications handle user input from the public Internet. If the application does not validate or sanitize input properly, attackers could perform SQL injection to manipulate database queries. This may expose private data or even allow full database compromise. The organization should use parameterized queries, strong server-side input validation, and regular code scanning.

**Solution:** Deploying a Web Application Firewall (WAF) in the DMZ would provide additional protection by blocking harmful requests and logging suspicious activity (CISA, 2006).

### Server Privilege Escalation

Inside the Datacenter, some services or processes may be running with unnecessary high privileges. If an attacker compromises a lower-level account, they could escalate their privileges and gain administrative control over critical systems such as application servers or the database server.

**Solution:** The company should apply the principle of least privilege, enforce multi-factor authentication for all administrator accounts, and maintain a strict role-based access control system. Regular updates, patch management, and server hardening are also necessary to reduce privilege escalation risks.

### Load Balancer Misconfiguration

The Edge zone routes traffic through a reverse proxy or load balancer. If this component is configured incorrectly, it may expose internal IP addresses, forward sensitive headers, or send requests to unintended backend systems. This could help attackers map the internal architecture or bypass certain security controls (CISA, 2006).

**Solution:** Administrators should restrict allowed headers, hide internal IP information, and enforce encrypted connections between the proxy and backend servers. The proxy configuration should be included in regular security audits to ensure it follows best practices and does not accidentally widen the attack surface.

### Network Device Configuration Security

Many network switches and firewalls inside this enterprise system could still be using default or weak passwords. If attackers gain access to the device management interface, they can change configurations or monitor traffic. This would cause the entire network to lose control and expose sensitive data.

**Solution:** All network devices should use strong password policies, disable Telnet access, and switch to secure management protocols like SSH. It is also important to review configuration changes regularly and back up the device settings.

### Poor Network Segmentation

From the diagram, it is not fully clear whether different areas like the DMZ, Datacenter, and Management Network are separated with VLANs. If everything is placed inside the same broadcast domain, attackers could move sideways once they enter the network.

**Solution:** Create VLANs for different trust zones and control traffic between them using access control lists. This helps reduce the chance of internal spread during an attack (Cisco).

### Weak IP Address Management

This network has a lot of servers and single-board computers. If DHCP and static IP addresses are not well planned, there could be IP conflicts or unauthorized devices joining the network.

**Solution:** Divide the network into multiple IP subnets based on the function and implement proper DHCP reservations. Using centralized IP Address Management tools would help monitor device connections more effectively.

### Insecure Transmission Protocols

Services like NFS and PXE in the diagram may be running on unencrypted communication protocols. Attackers could capture data packets and steal sensitive files or even inject malicious software during system installation.

**Solution:** Use secure tunneling options such as IPsec or VPN when transmitting sensitive data. System images and storage files should include digital signature validation to prevent tampering.

### Insufficient Firewall Rule Restrictions

Even though a firewall is placed at the edge, it may allow too many open ports for communication between DMZ and internal systems. This increases the risk of exposing private servers to the public internet.

**Solution:** Apply the principle of "deny by default and allow only required traffic." The firewall policies must be audited regularly to ensure minimal exposure.

### Remote Administration Exposure

Some servers in the diagram include IPMI or serial console access. If these management paths are reachable from the internal network, attackers could use them to control devices directly and bypass all main security protection.

**Solution:** Place remote management interfaces inside a separate and highly restricted management VLAN. Strong passwords and multi-factor authentication should be applied for admin accounts.

### Lack of Log Monitoring and Alerting

Each firewall, switch, and server may generate a large number of logs every day. If there is no centralized monitoring system, security incidents might not be discovered in time, such as brute-force login attempts or internal scanning.

**Solution:** Deploy a logging server or SIEM system to collect and analyze all device logs. Security alerts should be set up to notify administrators when suspicious behaviors happen.

## References

New Diagram: Physical Network. (n.d.). https://www.reddit.com/r/homelab/comments/bmiqi4/new_diagram_physical_network_spent_too_much_time/

What is a web application firewall (WAF)? (n.d.). Cisco. https://www.cisco.com/site/us/en/learn/topics/security/what-is-web-application-firewall-waf.html

10 network segmentation best practices. (2024, October 23). www.firemon.com. https://www.firemon.com/blog/network-segmentation-best-practices/

Industrial automation security design guide 2.0. (n.d.). Cisco. https://www.cisco.com/c/en/us/td/docs/Technology/industrial-automation-security-design-guide/m-segment-the-network-into-smaller-trust-zones.html

Network Segmentation - Best Practices. (2024, November). https://support.catonetworks.com/hc/en-us/articles/360004507617-Network-Segmentation

Network segmentation best practices | Ascendant technologies. (2025, July 21). Ascendant Technologies, Inc. https://ascendantusa.com/2023/08/21/network-segmentation-best-practices/

Securing network infrastructure devices | CISA. (2006, September 6). Cybersecurity and Infrastructure Security Agency CISA. https://www.cisa.gov/news-events/news/securing-network-infrastructure-devices
