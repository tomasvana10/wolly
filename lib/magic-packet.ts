import { Buffer } from "node:buffer";
import dgram from "node:dgram";

export const sendMagicPacket = (macaddr: string) => {
  const socket = dgram.createSocket("udp4");

  socket.bind(() => {
    socket.setBroadcast(true);
    socket.send(
      buildMagicPacket(macAddressStringToBytes(macaddr)),
      9,
      "255.255.255.255",
      () => socket.close()
    );
  });
};

const buildMagicPacket = (macaddrValues: number[]) => {
  // magic packet = 0xff * 6 + mac address * 16
  const packet = Buffer.alloc(6 + 16 * 6);
  packet.fill(0xff, 0, 6);

  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < macaddrValues.length; j++) {
      packet[6 + i * 6 + j] = macaddrValues[j];
    }
  }

  return packet;
};

const macAddressStringToBytes = (macaddr: string) => {
  return macaddr.split(":").map(base16 => parseInt(base16, 16));
};
