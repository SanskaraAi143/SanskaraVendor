import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ProfileAmenitiesInfo: React.FC<any> = ({
  isEditing,
  getDetailValue,
  updateDetailField,
  venueData
}) => {
  // Amenities fields
  const parkingCars = getDetailValue('amenities.parkingCars', '');
  const parkingTwoWheelers = getDetailValue('amenities.parkingTwoWheelers', '');
  const valetParkingAvailable = getDetailValue('amenities.valetParkingAvailable', '');
  const valetParkingCost = getDetailValue('amenities.valetParkingCost', '');
  const totalRooms = getDetailValue('amenities.totalRooms', '');
  const acRooms = getDetailValue('amenities.acRooms', '');
  const nonAcRooms = getDetailValue('amenities.nonAcRooms', '');
  const complimentaryRoomsOffered = getDetailValue('amenities.complimentaryRoomsOffered', '');
  const extraRoomCharges = getDetailValue('amenities.extraRoomCharges', '');
  const roomAmenities = getDetailValue('amenities.roomAmenities', []);
  const roomAmenitiesOther = getDetailValue('amenities.roomAmenitiesOther', '');
  const powerBackupCapacity = getDetailValue('amenities.powerBackupCapacity', '');
  const powerBackupDuration = getDetailValue('amenities.powerBackupDuration', '');
  const soundSystem = getDetailValue('amenities.soundSystem', '');
  const projectorScreen = getDetailValue('amenities.projectorScreen', '');
  const djServices = getDetailValue('amenities.djServices', '');
  const djCostInHouse = getDetailValue('amenities.djCostInHouse', '');
  const washroomsNumber = getDetailValue('amenities.washroomsNumber', '');
  const washroomsCleanlinessDescription = getDetailValue('amenities.washroomsCleanlinessDescription', '');
  const wheelchairAccessAvailable = getDetailValue('amenities.wheelchairAccessAvailable', '');
  const elevatorForGuests = getDetailValue('amenities.elevatorForGuests', '');
  const eventStaffNumber = getDetailValue('amenities.eventStaffNumber', '');
  const eventStaffServicesCovered = getDetailValue('amenities.eventStaffServicesCovered', '');
  const wifiAvailable = getDetailValue('amenities.wifiAvailable', '');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block font-medium mb-1">Parking (Cars)</label>
              <Input value={parkingCars} onChange={e => updateDetailField('amenities.parkingCars', e.target.value)} placeholder="e.g. 50" />
            </div>
            <div>
              <label className="block font-medium mb-1">Parking (Two Wheelers)</label>
              <Input value={parkingTwoWheelers} onChange={e => updateDetailField('amenities.parkingTwoWheelers', e.target.value)} placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block font-medium mb-1">Valet Parking Available</label>
              <Input value={valetParkingAvailable} onChange={e => updateDetailField('amenities.valetParkingAvailable', e.target.value)} placeholder="Yes/No" />
            </div>
            <div>
              <label className="block font-medium mb-1">Valet Parking Cost</label>
              <Input value={valetParkingCost} onChange={e => updateDetailField('amenities.valetParkingCost', e.target.value)} placeholder="e.g. 2000" />
            </div>
            <div>
              <label className="block font-medium mb-1">Total Rooms</label>
              <Input value={totalRooms} onChange={e => updateDetailField('amenities.totalRooms', e.target.value)} placeholder="e.g. 10" />
            </div>
            <div>
              <label className="block font-medium mb-1">AC Rooms</label>
              <Input value={acRooms} onChange={e => updateDetailField('amenities.acRooms', e.target.value)} placeholder="e.g. 5" />
            </div>
            <div>
              <label className="block font-medium mb-1">Non-AC Rooms</label>
              <Input value={nonAcRooms} onChange={e => updateDetailField('amenities.nonAcRooms', e.target.value)} placeholder="e.g. 5" />
            </div>
            <div>
              <label className="block font-medium mb-1">Complimentary Rooms Offered</label>
              <Input value={complimentaryRoomsOffered} onChange={e => updateDetailField('amenities.complimentaryRoomsOffered', e.target.value)} placeholder="Yes/No" />
            </div>
            <div>
              <label className="block font-medium mb-1">Extra Room Charges</label>
              <Input value={extraRoomCharges} onChange={e => updateDetailField('amenities.extraRoomCharges', e.target.value)} placeholder="e.g. 1000/night" />
            </div>
            <div>
              <label className="block font-medium mb-1">Room Amenities</label>
              <Textarea value={Array.isArray(roomAmenities) ? roomAmenities.join(', ') : roomAmenities} onChange={e => updateDetailField('amenities.roomAmenities', e.target.value.split(',').map((s: string) => s.trim()))} placeholder="e.g. TV, WiFi, Mini Fridge" rows={2} />
            </div>
            <div>
              <label className="block font-medium mb-1">Other Room Amenities</label>
              <Input value={roomAmenitiesOther} onChange={e => updateDetailField('amenities.roomAmenitiesOther', e.target.value)} placeholder="Other amenities..." />
            </div>
            <div>
              <label className="block font-medium mb-1">Power Backup Capacity</label>
              <Input value={powerBackupCapacity} onChange={e => updateDetailField('amenities.powerBackupCapacity', e.target.value)} placeholder="e.g. 10kVA" />
            </div>
            <div>
              <label className="block font-medium mb-1">Power Backup Duration</label>
              <Input value={powerBackupDuration} onChange={e => updateDetailField('amenities.powerBackupDuration', e.target.value)} placeholder="e.g. 4 hours" />
            </div>
            <div>
              <label className="block font-medium mb-1">Sound System</label>
              <Input value={soundSystem} onChange={e => updateDetailField('amenities.soundSystem', e.target.value)} placeholder="Yes/No/Details" />
            </div>
            <div>
              <label className="block font-medium mb-1">Projector & Screen</label>
              <Input value={projectorScreen} onChange={e => updateDetailField('amenities.projectorScreen', e.target.value)} placeholder="Yes/No/Details" />
            </div>
            <div>
              <label className="block font-medium mb-1">DJ Services</label>
              <Input value={djServices} onChange={e => updateDetailField('amenities.djServices', e.target.value)} placeholder="Yes/No/Details" />
            </div>
            <div>
              <label className="block font-medium mb-1">DJ Cost (In-house)</label>
              <Input value={djCostInHouse} onChange={e => updateDetailField('amenities.djCostInHouse', e.target.value)} placeholder="e.g. 5000" />
            </div>
            <div>
              <label className="block font-medium mb-1">Number of Washrooms</label>
              <Input value={washroomsNumber} onChange={e => updateDetailField('amenities.washroomsNumber', e.target.value)} placeholder="e.g. 8" />
            </div>
            <div>
              <label className="block font-medium mb-1">Washroom Cleanliness Description</label>
              <Textarea value={washroomsCleanlinessDescription} onChange={e => updateDetailField('amenities.washroomsCleanlinessDescription', e.target.value)} placeholder="Describe cleanliness..." rows={2} />
            </div>
            <div>
              <label className="block font-medium mb-1">Wheelchair Access Available</label>
              <Input value={wheelchairAccessAvailable} onChange={e => updateDetailField('amenities.wheelchairAccessAvailable', e.target.value)} placeholder="Yes/No" />
            </div>
            <div>
              <label className="block font-medium mb-1">Elevator for Guests</label>
              <Input value={elevatorForGuests} onChange={e => updateDetailField('amenities.elevatorForGuests', e.target.value)} placeholder="Yes/No" />
            </div>
            <div>
              <label className="block font-medium mb-1">Event Staff Number</label>
              <Input value={eventStaffNumber} onChange={e => updateDetailField('amenities.eventStaffNumber', e.target.value)} placeholder="e.g. 10" />
            </div>
            <div>
              <label className="block font-medium mb-1">Event Staff Services Covered</label>
              <Textarea value={eventStaffServicesCovered} onChange={e => updateDetailField('amenities.eventStaffServicesCovered', e.target.value)} placeholder="Describe services..." rows={2} />
            </div>
            <div>
              <label className="block font-medium mb-1">WiFi Available</label>
              <Input value={wifiAvailable} onChange={e => updateDetailField('amenities.wifiAvailable', e.target.value)} placeholder="Yes/No" />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div><span className="font-semibold">Parking (Cars):</span> {parkingCars || 'N/A'}</div>
            <div><span className="font-semibold">Parking (Two Wheelers):</span> {parkingTwoWheelers || 'N/A'}</div>
            <div><span className="font-semibold">Valet Parking Available:</span> {valetParkingAvailable || 'N/A'}</div>
            <div><span className="font-semibold">Valet Parking Cost:</span> {valetParkingCost || 'N/A'}</div>
            <div><span className="font-semibold">Total Rooms:</span> {totalRooms || 'N/A'}</div>
            <div><span className="font-semibold">AC Rooms:</span> {acRooms || 'N/A'}</div>
            <div><span className="font-semibold">Non-AC Rooms:</span> {nonAcRooms || 'N/A'}</div>
            <div><span className="font-semibold">Complimentary Rooms Offered:</span> {complimentaryRoomsOffered || 'N/A'}</div>
            <div><span className="font-semibold">Extra Room Charges:</span> {extraRoomCharges || 'N/A'}</div>
            <div><span className="font-semibold">Room Amenities:</span> {Array.isArray(roomAmenities) ? roomAmenities.join(', ') : roomAmenities || 'N/A'}</div>
            <div><span className="font-semibold">Other Room Amenities:</span> {roomAmenitiesOther || 'N/A'}</div>
            <div><span className="font-semibold">Power Backup Capacity:</span> {powerBackupCapacity || 'N/A'}</div>
            <div><span className="font-semibold">Power Backup Duration:</span> {powerBackupDuration || 'N/A'}</div>
            <div><span className="font-semibold">Sound System:</span> {soundSystem || 'N/A'}</div>
            <div><span className="font-semibold">Projector & Screen:</span> {projectorScreen || 'N/A'}</div>
            <div><span className="font-semibold">DJ Services:</span> {djServices || 'N/A'}</div>
            <div><span className="font-semibold">DJ Cost (In-house):</span> {djCostInHouse || 'N/A'}</div>
            <div><span className="font-semibold">Number of Washrooms:</span> {washroomsNumber || 'N/A'}</div>
            <div><span className="font-semibold">Washroom Cleanliness Description:</span> {washroomsCleanlinessDescription || 'N/A'}</div>
            <div><span className="font-semibold">Wheelchair Access Available:</span> {wheelchairAccessAvailable || 'N/A'}</div>
            <div><span className="font-semibold">Elevator for Guests:</span> {elevatorForGuests || 'N/A'}</div>
            <div><span className="font-semibold">Event Staff Number:</span> {eventStaffNumber || 'N/A'}</div>
            <div><span className="font-semibold">Event Staff Services Covered:</span> {eventStaffServicesCovered || 'N/A'}</div>
            <div><span className="font-semibold">WiFi Available:</span> {wifiAvailable || 'N/A'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAmenitiesInfo;
