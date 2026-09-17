import matplotlib.pyplot as plt
import numpy as np

# Updated F1-Scores with Telco as Primary
datasets = ['Telco Churn\n(Primary)', 'Bank Marketing\n(Imbalanced)', 'Bank Churn\n(Highly Correlated)']
macro_f1 = [0.72, 0.65, 1.00]
weighted_f1 = [0.79, 0.87, 1.00]

# Set up the bar chart locations
x = np.arange(len(datasets))
width = 0.35 

fig, ax = plt.subplots(figsize=(9, 6))

# Plot the bars
rects1 = ax.bar(x - width/2, macro_f1, width, label='Macro Average F1 (Treats classes equally)', color='#2c7bb6')
rects2 = ax.bar(x + width/2, weighted_f1, width, label='Weighted Average F1 (Favors majority class)', color='#d7191c')

# Add labels, titles, and custom formatting
ax.set_ylabel('F1-Score', fontsize=12)
ax.set_title('Macro vs. Weighted F1-Scores Across Datasets', fontsize=14, pad=15)
ax.set_xticks(x)
ax.set_xticklabels(datasets, fontsize=12)
ax.set_ylim(0, 1.25) # Leave room for the legend
ax.legend(fontsize=11)

# Add the exact numbers on top of the bars
ax.bar_label(rects1, padding=3, fmt='%.2f', fontsize=11, fontweight='bold')
ax.bar_label(rects2, padding=3, fmt='%.2f', fontsize=11, fontweight='bold')

plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.tight_layout()

# Save the high-resolution image for your Word document
plt.savefig('models/macro_vs_weighted_f1.png', dpi=300)
print("✅ Graph successfully saved to models/macro_vs_weighted_f1.png")