import {Group} from 'konva/lib/Group';
import {Container, ContainerConfig} from 'konva/lib/Container';
import {Origin, Size} from '../types';
import {
  getOriginDelta,
  getOriginOffset,
  ILayoutNode,
  isInsideLayout,
  LAYOUT_CHANGE_EVENT,
  LayoutAttrs,
} from '../components/ILayoutNode';
import Konva from 'konva';
import {IRect} from 'konva/lib/types';
import Vector2d = Konva.Vector2d;

export type LayoutGroupConfig = Partial<LayoutAttrs> & ContainerConfig;

export abstract class LayoutGroup extends Group implements ILayoutNode {
  public attrs: LayoutGroupConfig;

  public constructor(config?: LayoutGroupConfig) {
    super({
      color: '#242424',
      radius: 8,
      ...config,
    });
    this.on(LAYOUT_CHANGE_EVENT, () => this.handleLayoutChange());
    this.handleLayoutChange();
  }

  public abstract getLayoutSize(): Size;

  public setRadius(value: number): this {
    this.attrs.radius = value;
    return this;
  }

  public getRadius(): number {
    return this.attrs.radius ?? 0;
  }

  public setMargin(value: number): this {
    this.attrs.margin = value;
    return this;
  }

  public getMargin(): Origin {
    return this.attrs.margin ?? 0;
  }

  public setPadding(value: number): this {
    this.attrs.padding = value;
    return this;
  }

  public getPadding(): number {
    return this.attrs.padding ?? 0;
  }

  public setColor(value: string): this {
    this.attrs.color = value;
    return this;
  }

  public getColor(): string {
    return this.attrs.color ?? '#000';
  }

  public setOrigin(value: Origin): this {
    if (!isInsideLayout(this)) {
      this.move(this.getOriginDelta(value));
    }
    this.attrs.origin = value;
    this.offset(this.getOriginOffset());
    this.fireLayoutChange();

    return this;
  }

  public getOrigin(): Origin {
    return this.attrs.origin ?? Origin.Middle;
  }

  public withOrigin(origin: Origin, action: () => void) {
    const previousOrigin = this.getOrigin();
    this.setOrigin(origin);
    action();
    this.setOrigin(previousOrigin);
  }

  public getOriginOffset(customOrigin?: Origin): Vector2d {
    return getOriginOffset(
      this.getLayoutSize(),
      customOrigin ?? this.getOrigin(),
    );
  }

  public getOriginDelta(newOrigin: Origin) {
    return getOriginDelta(this.getLayoutSize(), this.getOrigin(), newOrigin);
  }

  public getClientRect(config?: {
    skipTransform?: boolean;
    skipShadow?: boolean;
    skipStroke?: boolean;
    relativeTo?: Container;
  }): IRect {
    const size = this.getLayoutSize();
    const offset = this.getOriginOffset(Origin.TopLeft);

    const rect: IRect = {
      x: offset.x,
      y: offset.y,
      width: size.width,
      height: size.height,
    };

    if (!config?.skipTransform) {
      return this._transformedRect(rect, config?.relativeTo);
    }

    return rect;
  }

  protected fireLayoutChange() {
    this.getParent()?.fire(LAYOUT_CHANGE_EVENT, undefined, true);
  }

  protected handleLayoutChange() {}
}