import React, { useState } from 'react';
import { UseFormRegister, FormState } from 'react-hook-form';
import { Check } from 'lucide-react';
import { PaymentFormSchema } from '../../utils/validation.schema';

interface PaymentMethodsProps {
  register: UseFormRegister<PaymentFormSchema>;
  formState: FormState<PaymentFormSchema>;
}

const paymentOptions = [
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: 'truck',
  },
  {
    id: 'bank-transfer',
    label: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản qua tài khoản ngân hàng',
    icon: 'bank',
  },
  {
    id: 'card',
    label: 'Thẻ tín dụng/ghi nợ',
    description: 'Thanh toán bằng thẻ Visa, Mastercard',
    icon: 'card',
  },
];

const renderIcon = (iconType: string, isSelected: boolean) => {
  const iconColor = 'outline-white';
  
  if (iconType === 'truck') {
    return (
      <div className="w-6 h-6 relative overflow-hidden">
        <div className={`w-5 h-3 left-[3px] top-[3px] absolute outline outline-2 outline-offset-[-1px] ${iconColor}`} />
        <div className={`w-4 h-4 left-[3px] top-[5px] absolute outline outline-2 outline-offset-[-1px] ${iconColor}`} />
      </div>
    );
  }
  
  if (iconType === 'bank') {
    return (
      <div className="w-6 h-6 relative overflow-hidden">
        <div className={`w-1 h-0 left-[10px] top-[12px] absolute outline outline-2 outline-offset-[-1px] ${iconColor}`} />
        <div className={`w-1 h-0 left-[10px] top-[8px] absolute outline outline-2 outline-offset-[-1px] ${iconColor}`} />
        <div className={`w-1 h-[5px] left-[10px] top-[16px] absolute outline outline-2 outline-offset-[-1px] ${iconColor}`} />
        <div className={`w-5 h-3.5 left-[2px] top-[7px] absolute outline outline-2 outline-offset-[-1px] ${iconColor}`} />
        <div className={`w-3 h-4 left-[6px] top-[3px] absolute outline outline-2 outline-offset-[-1px] ${iconColor}`} />
      </div>
    );
  }
  
  if (iconType === 'card') {
    return (
      <div className="w-6 h-6 relative overflow-hidden">
        <div className={`w-5 h-3.5 left-[2px] top-[5px] absolute outline outline-2 outline-offset-[-1px] ${iconColor}`} />
        <div className={`w-5 h-0 left-[2px] top-[10px] absolute outline outline-2 outline-offset-[-1px] ${iconColor}`} />
      </div>
    );
  }
};

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ register, formState: { errors } }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('cod');

  return (
    <div className="w-full px-8 pt-8 pb-8 bg-white rounded-[10px] shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] shadow-md flex flex-col justify-start items-start gap-6">
      <div className="self-stretch h-7 relative">
        <div className="left-0 top-[-2.40px] absolute justify-start text-zinc-800 text-xl font-normal font-arimo leading-8">
          Phương thức thanh toán
        </div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        {paymentOptions.map((option) => {
          const isSelected = selectedMethod === option.id;

          return (
            <label
              key={option.id}
              className={`self-stretch h-20 px-4 pt-4 pb-[1.60px] rounded-[10px] outline outline-[1.60px] outline-offset-[-1.60px] flex flex-col justify-start items-start cursor-pointer transition ${
                isSelected
                  ? 'bg-orange-100 outline-stone-400'
                  : 'bg-white outline-gray-200'
              }`}
            >
              <div className="self-stretch h-12 inline-flex justify-start items-center gap-4">
                {/* Icon Circle */}
                <div className="w-12 h-12 rounded-full flex justify-center items-center flex-shrink-0 bg-[#C9A16E]">
                  {renderIcon(option.icon, isSelected)}
                </div>

                {/* Text Content */}
                <div className="flex-1 h-12 inline-flex flex-col justify-start items-start gap-1">
                  <div className="self-stretch h-6 relative">
                    <div className="left-0 top-[-2.20px] absolute justify-start text-zinc-800 text-base font-normal font-arimo leading-6">
                      {option.label}
                    </div>
                  </div>
                  <div className="self-stretch h-5 relative">
                    <div className="left-0 top-[-1.20px] absolute justify-start text-neutral-400 text-sm font-normal font-arimo leading-5">
                      {option.description}
                    </div>
                  </div>
                </div>

                {/* Radio Button / Checkmark */}
                <div className={`w-6 h-6 rounded-full flex justify-center items-center flex-shrink-0 ${isSelected ? 'bg-[#C9A16E]' : 'bg-gray-300'}`}>
                  <input
                    type="radio"
                    value={option.id}
                    {...register('paymentMethod')}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="hidden"
                  />
                  {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {errors.paymentMethod && (
        <p className="text-red-500 text-xs mt-4 font-arimo">
          {errors.paymentMethod.message}
        </p>
      )}
    </div>
  );
};
