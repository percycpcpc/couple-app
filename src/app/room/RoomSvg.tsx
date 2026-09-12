import Image from "next/image";

export function PixelRoomBackground() {
  return (
    <Image
      src="/images/room-bg.png"
      alt="Cozy isometric room"
      fill
      className="object-cover [image-rendering:pixelated]"
      priority
      sizes="(max-width: 640px) 100vw, 760px"
    />
  );
}
