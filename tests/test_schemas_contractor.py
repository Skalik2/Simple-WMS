from app.schemas import ContractorUpdate

def test_contractor_update_schema():
    data = {"name": "Test Contractor", "nip": "1234567890"}
    schema = ContractorUpdate(**data)
    assert schema.name == "Test Contractor"
    assert schema.nip == "1234567890"

def test_contractor_update_schema_optional_nip():
    data = {"name": "Test Contractor"}
    schema = ContractorUpdate(**data)
    assert schema.name == "Test Contractor"
    assert schema.nip is None
