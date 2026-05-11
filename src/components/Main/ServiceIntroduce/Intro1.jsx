import intro1Img from '@/assets/images/main/intro1_img.svg';

export default function Intro1() {
  return (
    <div className="absolute inset-0 bg-[#3D3835]">
      <img src={intro1Img} alt="" className="absolute bottom-0 left-0 w-full" />
    </div>
  );
}
