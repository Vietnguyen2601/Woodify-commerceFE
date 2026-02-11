import React from 'react'

export default function ShippingSettings() {
  return (
    <div className="w-[985.20px] self-stretch relative overflow-hidden">
      <div className="w-[959.20px] h-[560.86px] left-[13px] top-[13px] absolute inline-flex flex-col justify-start items-start gap-3.5">
        <div className="self-stretch h-11 flex flex-col justify-start items-start gap-[3.25px]">
          <div className="self-stretch h-7 relative">
            <div className="left-0 top-[-1.40px] absolute justify-start text-stone-900 text-xl font-bold font-['Arimo'] leading-7">Giao hàng loạt</div>
          </div>
          <div className="self-stretch h-3 inline-flex justify-start items-start">
            <div className="flex-1 justify-start text-stone-600 text-[9.75px] font-normal font-['Arimo'] leading-3">Xử lý nhiều đơn cùng lúc để tối ưu thời gian giao hàng</div>
          </div>
        </div>
        <div className="self-stretch h-16 pl-5 pt-3 bg-white rounded-xl outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 flex flex-col justify-start items-start">
          <div className="w-[918.60px] h-7 flex flex-col justify-start items-start">
            <div className="w-[918.60px] flex-1 bg-orange-100 rounded-xl inline-flex justify-center items-center gap-[0px]">
              <div className="flex-1 h-6 relative bg-white rounded-xl outline outline-[0.80px] outline-offset-[-0.80px] outline-black/0">
                <div className="w-3 h-3 left-[177.96px] top-[4.63px] absolute overflow-hidden">
                  <div className="w-2.5 h-2.5 left-[1.63px] top-[1.08px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                  <div className="w-0 h-1.5 left-[6.50px] top-[6.50px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                  <div className="w-2.5 h-[2.71px] left-[1.78px] top-[3.79px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                  <div className="w-[4.88px] h-[2.79px] left-[4.06px] top-[2.31px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                </div>
                <div className="w-20 left-[199.09px] top-[3.63px] absolute text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Chờ giao hàng (5)</div>
              </div>
              <div className="flex-1 h-6 relative rounded-xl outline outline-[0.80px] outline-offset-[-0.80px] outline-black/0">
                <div className="w-3 h-3 left-[195.63px] top-[4.63px] absolute overflow-hidden">
                  <div className="w-2.5 h-2.5 left-[1.08px] top-[1.08px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                  <div className="w-[3.25px] h-0.5 left-[4.88px] top-[5.42px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                </div>
                <div className="left-[216.75px] top-[3.63px] absolute text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Tạo phiếu</div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch h-96 relative">
          <div className="w-[635.13px] h-96 left-0 top-0 absolute inline-flex flex-col justify-start items-start gap-3">
            <div className="self-stretch h-32 pl-5 pt-3 bg-white rounded-xl outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 flex flex-col justify-start items-start">
              <div className="w-[594.53px] h-24 flex flex-col justify-start items-start gap-2.5">
                <div className="self-stretch h-11 flex flex-col justify-start items-start gap-1.5">
                  <div className="self-stretch h-3 inline-flex justify-start items-center gap-1.5">
                    <div className="flex-1 justify-start text-stone-900 text-[9.75px] font-bold font-['Arimo'] leading-3">Hạn giao hàng:</div>
                  </div>
                  <div className="self-stretch h-6 relative">
                    <div className="w-11 h-6 px-2.5 left-0 top-0 absolute bg-yellow-800 rounded inline-flex justify-center items-center gap-[4.88px]">
                      <div className="text-center justify-start text-white text-[9.75px] font-normal font-['Arimo'] leading-3">Tất cả</div>
                    </div>
                    <div className="w-14 h-6 px-2.5 left-[52.34px] top-0 absolute bg-stone-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 inline-flex justify-center items-center gap-[4.88px]">
                      <div className="text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Quá hạn</div>
                    </div>
                    <div className="w-16 h-6 px-2.5 left-[117.20px] top-0 absolute bg-stone-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 inline-flex justify-center items-center gap-[4.88px]">
                      <div className="text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Trong 24h</div>
                    </div>
                    <div className="w-14 h-6 px-2.5 left-[189.66px] top-0 absolute bg-stone-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 inline-flex justify-center items-center gap-[4.88px]">
                      <div className="text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Trên 24h</div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch h-11 flex flex-col justify-start items-start gap-1.5">
                  <div className="self-stretch h-3 inline-flex justify-start items-center gap-1.5">
                    <div className="flex-1 justify-start text-stone-900 text-[9.75px] font-bold font-['Arimo'] leading-3">Đơn vị vận chuyển:</div>
                  </div>
                  <div className="self-stretch h-6 relative">
                    <div className="w-14 h-6 left-0 top-0 absolute bg-stone-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20">
                      <div className="w-3 h-3 left-[8.93px] top-[4.88px] absolute overflow-hidden">
                        <div className="w-1.5 h-2 left-[1.08px] top-[2.17px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-[3.25px] h-0 left-[4.88px] top-[9.75px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-1 h-1.5 left-[7.58px] top-[4.33px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[8.13px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[2.71px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                      </div>
                      <div className="left-[28.05px] top-[3.88px] absolute text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">SPX</div>
                    </div>
                    <div className="w-16 h-6 left-[62.26px] top-0 absolute bg-stone-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20">
                      <div className="w-3 h-3 left-[8.93px] top-[4.88px] absolute overflow-hidden">
                        <div className="w-1.5 h-2 left-[1.08px] top-[2.17px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-[3.25px] h-0 left-[4.88px] top-[9.75px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-1 h-1.5 left-[7.58px] top-[4.33px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[8.13px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[2.71px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                      </div>
                      <div className="left-[30.05px] top-[3.88px] absolute text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">GHN</div>
                    </div>
                    <div className="w-16 h-6 left-[129.18px] top-0 absolute bg-stone-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20">
                      <div className="w-3 h-3 left-[8.93px] top-[4.88px] absolute overflow-hidden">
                        <div className="w-1.5 h-2 left-[1.08px] top-[2.17px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-[3.25px] h-0 left-[4.88px] top-[9.75px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-1 h-1.5 left-[7.58px] top-[4.33px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[8.13px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[2.71px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                      </div>
                      <div className="left-[29.05px] top-[3.88px] absolute text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">GHTK</div>
                    </div>
                    <div className="w-24 h-6 left-[199.95px] top-0 absolute bg-stone-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20">
                      <div className="w-3 h-3 left-[8.93px] top-[4.88px] absolute overflow-hidden">
                        <div className="w-1.5 h-2 left-[1.08px] top-[2.17px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-[3.25px] h-0 left-[4.88px] top-[9.75px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-1 h-1.5 left-[7.58px] top-[4.33px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[8.13px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[2.71px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                      </div>
                      <div className="left-[30.05px] top-[3.88px] absolute text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Viettel Post</div>
                    </div>
                    <div className="w-14 h-6 left-[295.70px] top-0 absolute bg-stone-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20">
                      <div className="w-3 h-3 left-[8.93px] top-[4.88px] absolute overflow-hidden">
                        <div className="w-1.5 h-2 left-[1.08px] top-[2.17px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-[3.25px] h-0 left-[4.88px] top-[9.75px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-1 h-1.5 left-[7.58px] top-[4.33px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[8.13px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[2.71px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                      </div>
                      <div className="left-[29.05px] top-[3.88px] absolute text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">J&amp;T</div>
                    </div>
                    <div className="w-20 h-6 left-[357.39px] top-0 absolute bg-stone-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20">
                      <div className="w-3 h-3 left-[8.93px] top-[4.88px] absolute overflow-hidden">
                        <div className="w-1.5 h-2 left-[1.08px] top-[2.17px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-[3.25px] h-0 left-[4.88px] top-[9.75px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-1 h-1.5 left-[7.58px] top-[4.33px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[8.13px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[2.71px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                      </div>
                      <div className="left-[30.05px] top-[3.88px] absolute text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Ninja Van</div>
                    </div>
                    <div className="w-16 h-6 left-[445.20px] top-0 absolute bg-stone-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20">
                      <div className="w-3 h-3 left-[8.93px] top-[4.88px] absolute overflow-hidden">
                        <div className="w-1.5 h-2 left-[1.08px] top-[2.17px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-[3.25px] h-0 left-[4.88px] top-[9.75px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-1 h-1.5 left-[7.58px] top-[4.33px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[8.13px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                        <div className="w-0.5 h-0.5 left-[2.71px] top-[8.67px] absolute outline outline-1 outline-offset-[-0.54px] outline-stone-900" />
                      </div>
                      <div className="left-[30.05px] top-[3.88px] absolute text-center justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Khác</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch h-72 bg-white rounded-xl outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 flex flex-col justify-start items-start">
              <div className="w-[633.53px] h-64 relative overflow-hidden">
                <div className="w-[633.53px] h-8 left-0 top-0 absolute">
                  <div className="w-[633.53px] h-8 left-0 top-0 absolute border-b-[0.80px] border-yellow-800/20">
                    <div className="w-10 h-8 left-0 top-0 absolute">
                      <div className="w-3 h-3 left-[6.50px] top-[9.83px] absolute bg-white rounded shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-[0.80px] border-yellow-800/20" />
                    </div>
                    <div className="w-48 h-8 left-[39px] top-0 absolute">
                      <div className="left-[6.50px] top-[8.55px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Sản phẩm</div>
                    </div>
                    <div className="w-20 h-8 left-[224.14px] top-0 absolute">
                      <div className="left-[6.50px] top-[8.55px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Mã đơn hàng</div>
                    </div>
                    <div className="w-20 h-8 left-[303.55px] top-0 absolute">
                      <div className="left-[6.50px] top-[8.55px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Người mua</div>
                    </div>
                    <div className="w-20 h-8 left-[379.89px] top-0 absolute">
                      <div className="left-[6.50px] top-[8.55px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Đơn vị VC</div>
                    </div>
                    <div className="w-24 h-8 left-[459.90px] top-0 absolute">
                      <div className="left-[6.50px] top-[8.55px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Thời gian xác nhận</div>
                    </div>
                    <div className="w-20 h-8 left-[559.01px] top-0 absolute">
                      <div className="left-[6.50px] top-[8.55px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Trạng thái</div>
                    </div>
                  </div>
                </div>
                <div className="w-[633.53px] h-56 left-0 top-[32.50px] absolute">
                  <div className="w-[633.53px] h-12 left-0 top-0 absolute border-b-[0.80px] border-yellow-800/20">
                    <div className="w-10 h-12 left-0 top-0 absolute">
                      <div className="w-3 h-3 left-[6.50px] top-[16.93px] absolute bg-white rounded shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-[0.80px] border-yellow-800/20" />
                    </div>
                    <div className="w-48 h-12 left-[39px] top-0 absolute">
                      <div className="w-44 h-8 left-[6.50px] top-[6.90px] absolute inline-flex justify-start items-center gap-1.5">
                        <div className="w-8 h-8 bg-gray-100 rounded flex justify-center items-center">
                          <img className="w-8 h-8 relative" src="https://placehold.co/33x33" />
                        </div>
                        <div className="w-28 h-3 flex justify-start items-start overflow-hidden">
                          <div className="justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Bàn ăn gỗ sồi cao cấp 1.6m</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-20 h-12 left-[224.14px] top-0 absolute">
                      <div className="left-[6.50px] top-[16.45px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Cousine'] leading-3">WD2401290001</div>
                    </div>
                    <div className="w-20 h-12 left-[303.55px] top-0 absolute">
                      <div className="left-[6.50px] top-[15.65px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Nguyễn Văn A</div>
                    </div>
                    <div className="w-20 h-12 left-[379.89px] top-0 absolute">
                      <div className="w-9 h-4 left-[6.50px] top-[14.23px] absolute rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 overflow-hidden">
                        <div className="left-[7.30px] top-[1.43px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">GHN</div>
                      </div>
                    </div>
                    <div className="w-24 h-12 left-[459.90px] top-0 absolute">
                      <div className="left-[6.50px] top-[15.65px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">2026-01-29 10:30</div>
                    </div>
                    <div className="w-20 h-12 left-[559.01px] top-0 absolute">
                      <div className="w-12 h-4 left-[6.50px] top-[14.23px] absolute bg-red-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-red-300 overflow-hidden">
                        <div className="left-[7.30px] top-[1.43px] absolute justify-start text-red-700 text-[9.75px] font-normal font-['Arimo'] leading-3">Quá hạn</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-[633.53px] h-12 left-0 top-[46.30px] absolute border-b-[0.80px] border-yellow-800/20">
                    <div className="w-10 h-12 left-0 top-0 absolute">
                      <div className="w-3 h-3 left-[6.50px] top-[16.92px] absolute bg-white rounded shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-[0.80px] border-yellow-800/20" />
                    </div>
                    <div className="w-48 h-12 left-[39px] top-0 absolute">
                      <div className="w-44 h-8 left-[6.50px] top-[6.90px] absolute inline-flex justify-start items-center gap-1.5">
                        <div className="w-8 h-8 bg-gray-100 rounded flex justify-center items-center">
                          <img className="w-8 h-8 relative" src="https://placehold.co/33x33" />
                        </div>
                        <div className="w-28 h-3 flex justify-start items-start overflow-hidden">
                          <div className="justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Bàn trà gỗ óc chó - Size M</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-20 h-12 left-[224.14px] top-0 absolute">
                      <div className="left-[6.50px] top-[16.45px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Cousine'] leading-3">WD2401290002</div>
                    </div>
                    <div className="w-20 h-12 left-[303.55px] top-0 absolute">
                      <div className="left-[6.50px] top-[15.65px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Trần Thị B</div>
                    </div>
                    <div className="w-20 h-12 left-[379.89px] top-0 absolute">
                      <div className="w-8 h-4 left-[6.50px] top-[14.23px] absolute rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 overflow-hidden">
                        <div className="left-[7.30px] top-[1.42px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">SPX</div>
                      </div>
                    </div>
                    <div className="w-24 h-12 left-[459.90px] top-0 absolute">
                      <div className="left-[6.50px] top-[15.65px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">2026-01-29 09:15</div>
                    </div>
                    <div className="w-20 h-12 left-[559.01px] top-0 absolute">
                      <div className="w-14 h-4 left-[6.50px] top-[14.23px] absolute bg-orange-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-orange-300 overflow-hidden">
                        <div className="left-[7.30px] top-[1.42px] absolute justify-start text-orange-700 text-[9.75px] font-normal font-['Arimo'] leading-3">Trong 24h</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-[633.53px] h-12 left-0 top-[92.60px] absolute border-b-[0.80px] border-yellow-800/20">
                    <div className="w-10 h-12 left-0 top-0 absolute">
                      <div className="w-3 h-3 left-[6.50px] top-[16.93px] absolute bg-white rounded shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-[0.80px] border-yellow-800/20" />
                    </div>
                    <div className="w-48 h-12 left-[39px] top-0 absolute">
                      <div className="w-44 h-8 left-[6.50px] top-[6.90px] absolute inline-flex justify-start items-center gap-1.5">
                        <div className="w-8 h-8 bg-gray-100 rounded flex justify-center items-center">
                          <img className="w-8 h-8 relative" src="https://placehold.co/33x33" />
                        </div>
                        <div className="w-28 h-3 flex justify-start items-start overflow-hidden">
                          <div className="justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Kệ sách gỗ thông 5 tầng</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-20 h-12 left-[224.14px] top-0 absolute">
                      <div className="left-[6.50px] top-[16.45px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Cousine'] leading-3">WD2401290003</div>
                    </div>
                    <div className="w-20 h-12 left-[303.55px] top-0 absolute">
                      <div className="left-[6.50px] top-[15.65px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Lê Văn C</div>
                    </div>
                    <div className="w-20 h-12 left-[379.89px] top-0 absolute">
                      <div className="w-9 h-4 left-[6.50px] top-[14.23px] absolute rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 overflow-hidden">
                        <div className="left-[7.30px] top-[1.42px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">GHN</div>
                      </div>
                    </div>
                    <div className="w-24 h-12 left-[459.90px] top-0 absolute">
                      <div className="left-[6.50px] top-[15.65px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">2026-01-29 08:45</div>
                    </div>
                    <div className="w-20 h-12 left-[559.01px] top-0 absolute">
                      <div className="w-14 h-4 left-[6.50px] top-[14.23px] absolute bg-orange-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-orange-300 overflow-hidden">
                        <div className="left-[7.30px] top-[1.42px] absolute justify-start text-orange-700 text-[9.75px] font-normal font-['Arimo'] leading-3">Trong 24h</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-[633.53px] h-12 left-0 top-[138.90px] absolute border-b-[0.80px] border-yellow-800/20">
                    <div className="w-10 h-12 left-0 top-0 absolute">
                      <div className="w-3 h-3 left-[6.50px] top-[16.93px] absolute bg-white rounded shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-[0.80px] border-yellow-800/20" />
                    </div>
                    <div className="w-48 h-12 left-[39px] top-0 absolute">
                      <div className="w-44 h-8 left-[6.50px] top-[6.90px] absolute inline-flex justify-start items-center gap-1.5">
                        <div className="w-8 h-8 bg-gray-100 rounded flex justify-center items-center">
                          <img className="w-8 h-8 relative" src="https://placehold.co/33x33" />
                        </div>
                        <div className="w-32 h-3 flex justify-start items-start overflow-hidden">
                          <div className="justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Bàn làm việc gỗ gụ Executive</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-20 h-12 left-[224.14px] top-0 absolute">
                      <div className="left-[6.50px] top-[16.45px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Cousine'] leading-3">WD2401290004</div>
                    </div>
                    <div className="w-20 h-12 left-[303.55px] top-0 absolute">
                      <div className="left-[6.50px] top-[15.65px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Hoàng Văn E</div>
                    </div>
                    <div className="w-20 h-12 left-[379.89px] top-0 absolute">
                      <div className="w-10 h-4 left-[6.50px] top-[14.23px] absolute rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 overflow-hidden">
                        <div className="left-[7.30px] top-[1.42px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">GHTK</div>
                      </div>
                    </div>
                    <div className="w-24 h-12 left-[459.90px] top-0 absolute">
                      <div className="left-[6.50px] top-[15.65px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">2026-01-29 07:20</div>
                    </div>
                    <div className="w-20 h-12 left-[559.01px] top-0 absolute">
                      <div className="w-14 h-4 left-[6.50px] top-[14.23px] absolute bg-green-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-green-300 overflow-hidden">
                        <div className="left-[7.30px] top-[1.42px] absolute justify-start text-green-700 text-[9.75px] font-normal font-['Arimo'] leading-3">Trên 24h</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-[633.53px] h-11 left-0 top-[185.20px] absolute">
                    <div className="w-10 h-11 left-0 top-0 absolute">
                      <div className="w-3 h-3 left-[6.50px] top-[16.92px] absolute bg-white rounded shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border-[0.80px] border-yellow-800/20" />
                    </div>
                    <div className="w-48 h-11 left-[39px] top-0 absolute">
                      <div className="w-44 h-8 left-[6.50px] top-[6.90px] absolute inline-flex justify-start items-center gap-1.5">
                        <div className="w-8 h-8 bg-gray-100 rounded flex justify-center items-center">
                          <img className="w-8 h-8 relative" src="https://placehold.co/33x33" />
                        </div>
                        <div className="w-24 h-3 flex justify-start items-start overflow-hidden">
                          <div className="justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Ghế ngoài trời gỗ teak</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-20 h-11 left-[224.14px] top-0 absolute">
                      <div className="left-[6.50px] top-[16.45px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Cousine'] leading-3">WD2401290005</div>
                    </div>
                    <div className="w-20 h-11 left-[303.55px] top-0 absolute">
                      <div className="left-[6.50px] top-[15.65px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Phạm Thị D</div>
                    </div>
                    <div className="w-20 h-11 left-[379.89px] top-0 absolute">
                      <div className="w-16 h-4 left-[6.50px] top-[14.22px] absolute rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-yellow-800/20 overflow-hidden">
                        <div className="left-[7.30px] top-[1.42px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">Viettel Post</div>
                      </div>
                    </div>
                    <div className="w-24 h-11 left-[459.90px] top-0 absolute">
                      <div className="left-[6.50px] top-[15.65px] absolute justify-start text-stone-900 text-[9.75px] font-normal font-['Arimo'] leading-3">2026-01-28 16:30</div>
                    </div>
                    <div className="w-20 h-11 left-[559.01px] top-0 absolute">
                      <div className="w-12 h-4 left-[6.50px] top-[14.22px] absolute bg-red-100 rounded outline outline-[0.80px] outline-offset-[-0.80px] outline-red-300 overflow-hidden">
                        <div className="left-[7.30px] top-[1.42px] absolute justify-start text-red-700 text-[9.75px] font-normal font-['Arimo'] leading-3">Quá hạn</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-80 h-96 left-[648.13px] top-0 absolute" />
        </div>
      </div>
      <div className="w-80 h-52 left-[661.13px] top-[147.84px] absolute bg-white rounded-xl outline outline-[1.60px] outline-offset-[-1.60px] outline-yellow-800/20">
        <div className="w-80 h-16 px-5 pt-5 pb-2.5 left-[1.60px] top-[1.60px] absolute inline-flex flex-col justify-start items-start">
          <div className="self-stretch self-stretch relative">
            <div className="w-4 h-4 left-0 top-[0.13px] absolute overflow-hidden">
              <div className="w-3 h-3.5 left-[2px] top-[1.33px] absolute outline outline-[1.33px] outline-offset-[-0.67px] outline-stone-900" />
              <div className="w-0 h-1.5 left-[8px] top-[8px] absolute outline outline-[1.33px] outline-offset-[-0.67px] outline-stone-900" />
              <div className="w-3 h-[3.33px] left-[2.19px] top-[4.67px] absolute outline outline-[1.33px] outline-offset-[-0.67px] outline-stone-900" />
              <div className="w-1.5 h-[3.43px] left-[5px] top-[2.85px] absolute outline outline-[1.33px] outline-offset-[-0.67px] outline-stone-900" />
            </div>
            <div className="left-[22.50px] top-[-2px] absolute justify-start text-stone-900 text-xs font-normal font-['Arimo'] leading-4">Chuẩn bị đơn hàng loạt</div>
          </div>
          <div className="self-stretch h-3 inline-flex justify-start items-start">
            <div className="flex-1 justify-start text-stone-600 text-[9.75px] font-normal font-['Arimo'] leading-3">Chọn đơn hàng để xử lý hàng loạt</div>
          </div>
        </div>
        <div className="w-64 h-28 left-[21.10px] top-[84.46px] absolute">
          <div className="w-8 h-8 left-[118.44px] top-[26px] absolute overflow-hidden">
            <div className="w-7 h-7 left-[2.67px] top-[2.67px] absolute outline outline-[2.67px] outline-offset-[-1.33px] outline-stone-600" />
            <div className="w-0 h-1.5 left-[16px] top-[10.67px] absolute outline outline-[2.67px] outline-offset-[-1.33px] outline-stone-600" />
            <div className="w-[0.01px] h-0 left-[16px] top-[21.33px] absolute outline outline-[2.67px] outline-offset-[-1.33px] outline-stone-600" />
          </div>
          <div className="w-64 h-3 left-0 top-[67.75px] absolute inline-flex justify-start items-start">
            <div className="flex-1 text-center justify-start text-stone-600 text-[9.75px] font-normal font-['Arimo'] leading-3">Vui lòng chọn ít nhất 1 đơn hàng để tiếp tục</div>
          </div>
        </div>
      </div>
    </div>
  )
}
