from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class AppointmentStatus(str, enum.Enum):
    SCHEDULED = 'Agendado'
    COMPLETED = 'Concluído'
    CANCELED = 'Cancelado'

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    email = Column(String, unique=True, index=True)
    address = Column(String)

    pets = relationship("Pet", back_populates="owner")

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    species = Column(String)
    breed = Column(String)
    birthDate = Column(String)
    ownerId = Column(Integer, ForeignKey("clients.id"))

    owner = relationship("Client", back_populates="pets")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    clientId = Column(Integer, ForeignKey("clients.id"))
    petId = Column(Integer, ForeignKey("pets.id"))
    date = Column(String)
    reason = Column(String)
    notes = Column(String, nullable=True)
    status = Column(Enum(AppointmentStatus))

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    price = Column(Float)
    stock = Column(Integer)

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    price = Column(Float)

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    total = Column(Float)
    date = Column(String)

    items = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    quantity = Column(Integer)
    price = Column(Float)

    sale = relationship("Sale", back_populates="items")
    product = relationship("Product")
    service = relationship("Service")
