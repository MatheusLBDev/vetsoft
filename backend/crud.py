from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
import models, schemas

def get_client(db: Session, client_id: int):
    return db.query(models.Client).filter(models.Client.id == client_id).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Client).options(joinedload(models.Client.pets)).offset(skip).limit(limit).all()

def create_client(db: Session, client: schemas.ClientCreate):
    db_client = models.Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def get_pet(db: Session, pet_id: int):
    return db.query(models.Pet).filter(models.Pet.id == pet_id).first()

def get_pets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Pet).offset(skip).limit(limit).all()

def create_pet(db: Session, pet: schemas.PetCreate):
    db_pet = models.Pet(**pet.model_dump())
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

def delete_pet(db: Session, pet_id: int):
    db_pet = get_pet(db, pet_id)
    if db_pet:
        db.delete(db_pet)
        db.commit()
    return db_pet

def get_appointment(db: Session, appointment_id: int):
    return db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Appointment).offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    db_appointment = models.Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment_status(db: Session, appointment_id: int, status: schemas.AppointmentStatus):
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        db_appointment.status = status
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_name(db: Session, name: str):
    return db.query(models.Product).filter(models.Product.name == name).first()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if db_product:
        update_data = product.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

def get_services(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Service).offset(skip).limit(limit).all()

def get_service(db: Session, service_id: int):
    return db.query(models.Service).filter(models.Service.id == service_id).first()

def get_service_by_name(db: Session, name: str):
    return db.query(models.Service).filter(models.Service.name == name).first()

def create_service(db: Session, service: schemas.ServiceCreate):
    db_service = models.Service(**service.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, service_id: int, service: schemas.ServiceUpdate):
    db_service = get_service(db, service_id)
    if db_service:
        update_data = service.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_service, key, value)
        db.commit()
        db.refresh(db_service)
    return db_service

def delete_service(db: Session, service_id: int):
    db_service = get_service(db, service_id)
    if db_service:
        db.delete(db_service)
        db.commit()
    return db_service

def get_sales(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Sale).options(joinedload(models.Sale.items)).order_by(models.Sale.date.desc()).offset(skip).limit(limit).all()

def get_sales_count(db: Session):
    return db.query(models.Sale).count()

def create_sale(db: Session, sale: schemas.SaleCreate):

    for item in sale.items:
        if item.product_id:
            db_product = get_product(db, item.product_id)
            if not db_product:
                raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
            if db_product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for product {db_product.name}. Available: {db_product.stock}, Required: {item.quantity}")

    db_sale = models.Sale(total=sale.total, date=sale.date)
    db.add(db_sale)
    db.flush() 

    for item in sale.items:
        db_item = models.SaleItem(**item.model_dump(), sale_id=db_sale.id)
        db.add(db_item)

        if item.product_id:

            db_product = get_product(db, item.product_id)
            if db_product:
                db_product.stock -= item.quantity

    db.commit()
    db.refresh(db_sale)
    db_sale = db.query(models.Sale).options(joinedload(models.Sale.items)).filter(models.Sale.id == db_sale.id).first()

    return db_sale
