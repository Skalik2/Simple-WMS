from app.schemas import ReportChartData, ReportCards, ReportResponse

def test_report_chart_data_schema():
    data = {"name": "Test", "pz": 10, "wz": 5}
    chart_data = ReportChartData(**data)
    assert chart_data.name == "Test"
    assert chart_data.pz == 10
    assert chart_data.wz == 5

def test_report_cards_schema():
    data = {"total_ops": 100, "top_product": "Product A", "total_stock": 500}
    cards = ReportCards(**data)
    assert cards.total_ops == 100
    assert cards.top_product == "Product A"
    assert cards.total_stock == 500

def test_report_response_schema():
    data = {
        "chart_data": [{"name": "Test", "pz": 10, "wz": 5}],
        "cards": {"total_ops": 100, "top_product": "Product A", "total_stock": 500}
    }
    response = ReportResponse(**data)
    assert len(response.chart_data) == 1
    assert response.chart_data[0].name == "Test"
    assert response.cards.total_ops == 100
