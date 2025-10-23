from pydantic import BaseModel
from typing import List, Optional
from models import AppointmentStatus

class PetBase(BaseModel):
    name: str
    species: str
    breed: str
    birthDate: str
    ownerId: int

class PetCreate(PetBase):
    pass

class Pet(PetBase):
    id: int

    class Config:
        orm_mode = True

class ClientBase(BaseModel):
    name: str
    phone: str
    email: str
    address: str

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int
    pets: List[Pet] = []

    class Config:
        orm_mode = True

class AppointmentBase(BaseModel):
    clientId: int
    petId: int
    date: str
    reason: str
    notes: Optional[str] = None
    status: AppointmentStatus

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: int

    class Config:
        orm_mode = True

class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None

class ServiceBase(BaseModel):
    name: str
    description: str
    price: float

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int

    class Config:
        orm_mode = True

class ServiceUpdate(ServiceBase):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None

class SaleItemBase(BaseModel):
    product_id: Optional[int] = None
    service_id: Optional[int] = None
    quantity: int
    price: float

class SaleItemCreate(SaleItemBase):
    pass

class SaleItem(SaleItemBase):
    id: int

    class Config:
        orm_mode = True

class SaleBase(BaseModel):
    total: float
    date: str

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]

class Sale(SaleBase):
    id: int
    items: List[SaleItem] = []

    class Config:
        orm_mode = True
