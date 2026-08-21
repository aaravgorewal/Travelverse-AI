from typing import Tuple, Dict, Any, List
from app.schemas.smart_budget import BudgetOptimizationRequest, BudgetOptimizationResult, BudgetItem

class SmartBudgetService:
    @staticmethod
    def calculate_budget(request: BudgetOptimizationRequest) -> BudgetOptimizationResult:
        subtotal = 0.0
        total_tax = 0.0
        total_fees = 0.0
        
        category_totals: Dict[str, float] = {
            "flights": 0.0,
            "hotels": 0.0,
            "transfers": 0.0,
            "experiences": 0.0
        }
        
        def process_items(items: List[BudgetItem], category: str):
            nonlocal subtotal, total_tax, total_fees
            for item in items:
                base_amount = item.price.amount
                tax_amount = item.tax.amount if item.tax else 0.0
                fee_amount = item.fees.amount if item.fees else 0.0
                
                subtotal += base_amount
                total_tax += tax_amount
                total_fees += fee_amount
                
                category_totals[category] += (base_amount + tax_amount + fee_amount)

        process_items(request.flight_prices, "flights")
        process_items(request.hotel_prices, "hotels")
        process_items(request.transfer_prices, "transfers")
        process_items(request.experience_prices, "experiences")
        
        total = subtotal + total_tax + total_fees
        remaining_budget = request.budget - total
        over_budget = remaining_budget < 0
        
        if over_budget:
            status = "OVER_BUDGET"
        elif total == request.budget:
            status = "ON_BUDGET"
        else:
            status = "UNDER_BUDGET"
            
        category_percentages = {}
        if total > 0:
            for cat, amt in category_totals.items():
                category_percentages[cat] = (amt / total) * 100.0
        else:
            for cat in category_totals.keys():
                category_percentages[cat] = 0.0

        return BudgetOptimizationResult(
            subtotal=subtotal,
            total_tax=total_tax,
            total_fees=total_fees,
            total=total,
            remaining_budget=remaining_budget,
            over_budget=over_budget,
            status=status,
            category_percentages=category_percentages,
            ai_suggestions=[],
            suggested_cuts=[]
        )
