declare module 'framer' {
    export enum ControlType {
        Boolean = 'Boolean',
        Number = 'Number',
        String = 'String',
        Enum = 'Enum',
        Color = 'Color',
        Image = 'Image',
        File = 'File',
        ComponentInstance = 'ComponentInstance',
        Array = 'Array',
        Object = 'Object',
        ResponsiveImage = 'ResponsiveImage',
        Transition = 'Transition',
        EventHandler = 'EventHandler',
    }

    export function addPropertyControls(
        component: React.ComponentType<any>,
        controls: Record<string, any>
    ): void
}
