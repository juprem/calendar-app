import { prisma } from '#/db.ts';
import type { CreateContact, UpdateContact } from '#/models/ContactModel.ts';

export async function getAllContacts() {
  return prisma.contact.findMany({
    orderBy: {
      'lastname': 'asc',
    },
  });
}

export function createContact(data: CreateContact) {
  return prisma.contact.create({ data });
}

export function updateContact(id: number, data: Omit<UpdateContact, 'id'>) {
  return prisma.contact.update({ where: { id }, data });
}

export function deleteContact(id: number) {
  return prisma.contact.delete({ where: { id } });
}

export function bulkCreateContacts(contacts: CreateContact[]) {
  return prisma.contact.createMany({
    data: contacts,
    skipDuplicates: true,
  });
}

export function getContactRdv(contactId: number) {
  return prisma.rdv.findMany({
    where: { contact_id: contactId },
    include: { day: { select: { date: true } }, contact: true },
    orderBy: { day: { date: 'asc' } },
  });
}
