---
course_code: "IT 8000"
course_name: "Data Analytics"
title: "Cisco Systems Dataset Report"
description: "Excel-based financial data analysis of Cisco Systems' quarterly revenue, applying consolidation, conditional functions, and chart visualization techniques"
date: 2025/08/17
learning_outcome: "Design and execute data analytics workflows to extract meaningful insights from organizational data, communicating findings to support strategic and operational decisions."
status: "complete"
category: "it"
---

**Cisco Systems Dataset Report**

*Kun Zhang*
Ottawa University · IT 8000: Data Analytics
Dr. Nicholas Bowersox · August 17, 2025

---

## Introduction

The purpose of this report is to demonstrate how business data can be collected, consolidated, and analyzed using Microsoft Excel in order to generate meaningful insights for decision-making. For this report, I selected revenue data from Cisco Systems, focusing on three consecutive quarters (Q1, Q2, and Q3) and breaking it down into product revenue and service revenue. The reason for choosing this dataset is that Cisco is a major player in the technology and networking industry, and its financial performance by revenue type provides a clear example of how organizations monitor trends across time. By consolidating multiple datasets and applying Excel functions, I was able to calculate total revenues, compare contributions from products versus services, and create visualizations that highlight changes across the three quarters.

This project not only illustrates the technical use of Excel tools but also emphasizes the importance of data modeling and visualization in supporting organizational decisions. By analyzing Cisco's revenue data, the project connects course objectives such as plotting multiple datasets on the same chart, consolidating information, and using functions to analyze trends. More broadly, this work reflects how companies in the technology industry rely on data analysis to anticipate changes in customer demand, evaluate performance, and maintain competitiveness in a fast-evolving market.

## Rationale and Explanation for Cisco Systems' Dataset

For this project, I chose Cisco Systems' quarterly revenue data by product and service categories. The rationale for selecting Cisco is twofold. First, Cisco is a global leader in networking and technology solutions, which makes its revenue structure an excellent case for understanding how a large organization balances hardware, software, and service offerings. By examining product and service revenues across three quarters, it becomes possible to identify both short-term fluctuations and long-term business trends. Second, publicly available financial data from Cisco ensures that the analysis is both credible and relevant, allowing the project to align with real-world business intelligence practices.

This dataset was particularly valuable because it is organized into clear categories, which makes it well suited for applying Excel functions and visualization tools. By consolidating Q1, Q2, and Q3 revenues, the dataset provided a strong foundation for calculating totals, comparing differences between revenue sources, and identifying the relative contribution of products versus services. These insights are directly applicable to the broader technology industry, where companies increasingly rely on service-based revenue models to balance the cyclical nature of product sales.

## Table Analysis

This dataset is designed to provide a structured and standardized view of the company's financial performance for Q4 FY24. The goal is to make financial reporting clearer, consistent, and easier to analyze by separating each line item into distinct attributes.

At the beginning of the analysis, I set up fields for line item, period, type, amount, and formatted amount to create a table. This structure provided a clear foundation for organizing the revenue data into consistent categories, making it easier to identify trends across time and product segments. By defining these key fields, I ensured that the dataset was not only clean but also standardized for further calculations and visualizations. The table format also allowed for greater flexibility in applying Excel functions. For example, I used `IFS` to classify revenue by product category, `TEXT` to format the reporting period into a readable format, `SUM` to calculate total revenue across different services, `AVERAGE` to determine the mean revenue over quarters, and `IF` to highlight variations between forecasted and actual revenue.

For the Type field, I used the following formula to automatically classify each line item based on keywords:

```excel
=@IFS(
  ISNUMBER(SEARCH("revenue", A5)), "Revenue",
  ISNUMBER(SEARCH("cost", A5)) * NOT(ISNUMBER(SEARCH("income", A5))), "Cost",
  ISNUMBER(SEARCH("margin", A5)), "Margin",
  ISNUMBER(SEARCH("expense", A5)), "Expense",
  ISNUMBER(SEARCH("income", A5)) + ISNUMBER(SEARCH("interest", A5)) > 0, "Income",
  ISNUMBER(SEARCH("tax", A5)), "Tax",
  ISNUMBER(SEARCH("share", A5)), "Shares",
  TRUE, "Other"
)
```

The second table provides a structural overview of the dataset. Out of eight line items, revenue-related entries form the largest category, followed by costs, expenses, and income. Importantly, there are no blank cells in the Type column, confirming that the dataset is complete and well-structured for analysis. Additionally, three of the line items have values greater than 5,000, two of which are revenue items — highlighting the scale of Cisco's revenue streams relative to other financial categories.

The third table checks total revenue for Q4 FY2024 using multiple Excel functions. The `SUMIFS` function shows that total revenue across all relevant entries amounts to 27,284, reflecting the scale of Cisco's operations. The `AVERAGEIFS` calculations provide further insight by showing that the average revenue per entry is significantly higher than the average cost, highlighting profitability potential. The `COUNTIFS` functions confirm the presence of a single expense item and a single income item above the 2,000 threshold, ensuring the dataset is analyzed in specific conditional contexts as well as in totals.

## Graphic Visualization

The Pareto chart illustrates Cisco's operating expenses on 2024/07/27, broken down into key categories such as R&D, Sales & Marketing, G&A, Amortization, and Restructuring. The chart highlights that Sales & Marketing (2,841) and R&D (2,179) are the two largest contributors, together accounting for the majority of total expenses (6,163).

By applying the Pareto principle (80/20 rule), the chart makes it clear that a small number of categories explain most of the spending. This visualization is particularly valuable for decision-making because it allows management to prioritize cost-control efforts in the areas with the greatest financial impact, while recognizing that smaller categories such as Restructuring and Amortization contribute relatively little to the overall expense structure.

For the second and third charts, I used clustered column and combo charts. These visualize Cisco's revenue across three consecutive quarters in FY25, broken down into product categories (Networking, Security, Collaboration, Observability) and Services. The chart clearly shows that Networking remains the largest revenue contributor, with a gradual recovery from $6,753M in Q1 to $7,068M in Q3. Security revenue demonstrates strength and volatility, surging by over 100% in Q1 and Q2 before moderating in Q3. Collaboration revenue appears stable with only minor fluctuations, while Observability, though relatively small in absolute terms, shows consistently strong double-digit year-over-year growth.

By combining clustered columns with a line representing Total Revenue, the visualization highlights both the detailed breakdown of product categories and the overall growth trajectory. The chart demonstrates that Cisco's total revenue steadily increased from $13,841M in Q1 to $14,149M in Q3, supported by incremental gains across products and stable services. This dual view provides an intuitive understanding of how individual categories contribute to Cisco's overall financial performance.

This visualization also reflects broader strategic and industry implications. The steady rebound in Networking revenue indicates that Cisco's core hardware business remains resilient, but the company cannot rely solely on this segment for future growth. The strong momentum in Security revenue highlights a structural shift in customer priorities, as enterprises increasingly invest in network and data protection. Observability's consistent double-digit growth aligns with industry demand for advanced monitoring and analytics as IT environments become more complex. Services revenue, while relatively flat, provides a stable recurring income stream that cushions Cisco against fluctuations in hardware sales.

## Excel Functions

I used a combination of text functions and conditional formulas to categorize and analyze financial data.

**IFS:** Used to automatically classify the type of each line item based on keywords in column A. The formula checks for specific keywords in each row and assigns a corresponding category (Revenue, Cost, Margin, Expense, Income, Tax, Shares, or Other) to the Type field.

**TEXT:** Applied to format numerical values in millions with a dollar sign. For example, `=TEXT(D5,"$#,##0.00""M""")` converts raw numbers into a standardized, readable format. This improves clarity when presenting financial figures in reports or charts.

**SUMIFS:** Used to calculate the total values for specific categories such as Revenue. For example, `=SUMIFS(D5:D12, C5:C12, "Revenue")` sums all revenue amounts in the selected range, enabling comparison between categories across multiple periods.

**AVERAGEIFS:** Calculates the average value for a given category. For instance, `=AVERAGEIFS(D5:D12, C5:C12, "Revenue")` computes the mean revenue across selected rows, useful for identifying trends or anomalies. By combining `AVERAGEIFS` with `SUMIFS`, I obtained a fuller picture of both magnitude and consistency.

**COUNTIFS:** Used to count the number of occurrences of a specific type. For example, `=COUNTIFS(C5:C12, "Expense")` returns the total number of expense items in the dataset, helping detect patterns such as recurring costs or high-volume categories.

## Thorough Analysis

Cisco's financial data for FY24–FY25 highlights the continued dominance of product revenue in its overall business model. In Q1–Q3 FY25, Networking remains the largest revenue contributor, showing a gradual recovery from $6,753M in Q1 to $7,068M in Q3, while Security exhibits strong growth albeit with higher volatility. Services revenue has been comparatively stable, contributing around $3,727M–$3,775M across the three quarters, underlining the importance of recurring revenue streams for long-term stability. For Cisco, maintaining a balance between product and service revenue is essential to sustain growth while mitigating the risk of hardware market fluctuations.

From an industry perspective, the dataset illustrates the broader shift in the technology sector toward service-oriented models, including subscriptions, cloud offerings, and support services. Hardware sales remain a key short-term driver, but long-term competitiveness increasingly depends on service revenue growth. The use of Excel and BI/Decision Support tools proves invaluable in this context. By leveraging functions like `SUMIFS`, `AVERAGEIFS`, and classification formulas, management can quickly analyze trends, compare product lines, and make informed strategic decisions.

## Conclusion

Throughout this analysis, I gained practical experience in using Excel for financial data modeling, visualization, and analysis. By combining consolidation, charting, and function-based calculations, I was able to extract actionable insights from complex datasets. For Cisco, the key recommendation is to continue monitoring the balance between product and service revenues, with particular emphasis on expanding service offerings to secure sustainable growth. On a personal level, this exercise reinforced my ability to apply Excel functions systematically, classify financial metrics accurately, and generate meaningful visualizations to support management decisions. These skills are directly transferable to real-world business analysis scenarios.

## References

Advanced Excel — Pareto chart. (n.d.). *Tutorialspoint.* https://www.tutorialspoint.com/advanced_excel_charts/advanced_excel_pareto_chart.htm

FY25 Revenue by product category & service. (2025). *Cisco Financial Results.* https://investor.cisco.com/financial-information/financial-results/default.aspx

Gulbis, J. (2016, August 25). The 80/20 rule: How to calculate the Pareto principle? *eazyBI.* https://eazybi.com/blog/the-80-20-rule

TEXT function. (n.d.). *Microsoft Support.* https://support.microsoft.com/en-us/office/text-function-20d5ac4d-7b94-49fd-bb38-93d29371225c
