import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

export function Drawer({ isOpen, onClose, title, children, side = 'right' }: DrawerProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className={cn(
              'pointer-events-none fixed inset-y-0 flex max-w-full',
              side === 'right' ? 'right-0 pl-10' : 'left-0 pr-10'
            )}>
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom={side === 'right' ? 'translate-x-full' : '-translate-x-full'}
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo={side === 'right' ? 'translate-x-full' : '-translate-x-full'}
              >
                <Dialog.Panel className={cn(
                  'pointer-events-auto w-screen max-w-md',
                  'bg-white dark:bg-gray-800 shadow-xl'
                )}>
                  <div className="flex h-full flex-col overflow-y-scroll py-6">
                    {title && (
                      <div className="px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                          </Dialog.Title>
                          <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}